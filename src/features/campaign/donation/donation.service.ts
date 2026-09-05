import { Prisma } from "../../../generated/prisma/client";
import { DonationStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { storageService } from "../../../lib/storage.service";
import { AppError } from "../../../utils/AppError";
import { agentResult } from "../../../utils/userAgent";
import { AuditService } from "../../audit/service";
import { NotificationService } from "../../notification/service";
import { RequestCreateDonationDTO } from "./donation.validate";

export function maskName(name: string): string {
  if (!name || name.trim() === "" || name.toLowerCase() === "anonymous") {
    return "Hamba Allah"; // Atau "Anonim"
  }

  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 1) return word;
      if (word.length === 2) return `${word[0]}*`;
      return `${word[0]}${"*".repeat(word.length - 1)}`;
    })
    .join(" ");
}

export function timeAgo(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Jika selisih waktu minus/masa depan
  if (seconds < 5) {
    return "Baru saja";
  }

  const intervals: { [key: string]: number } = {
    tahun: 31536000,
    bulan: 2592000,
    minggu: 604800,
    hari: 86400,
    jam: 3600,
    menit: 60,
    detik: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit} yang lalu`;
    }
  }

  return "Baru saja";
}

const serviceAudit = new AuditService();
const servicNotif = new NotificationService();
export const StoreDonateService = async (agent: agentResult, data: RequestCreateDonationDTO, file: Express.Multer.File) => {
    try {
        const proof = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'donate',
        });

        return await prisma.$transaction( async(tx) => {
            const result = await tx.donation.create({
                data: {
                    ...data,
                    proofOfPaymentUrl: proof,
                    status: "PENDING"
                }
            })
    
            await serviceAudit.create(tx, null, "CREATE", "donation", result.id, agent, result)
            await servicNotif.create(tx, `Donasi baru telah masuk`, `Donasi sebesar Rp${result.amount.toLocaleString("id-ID")}, dilakukan oleh ${maskName(result.donorName)}`, "NEW_DONATION", result.id)
            return {
                id: result.id,
                donorName: result.donorName,
                amount: result.amount,
                message: result.message
            };
        } )
    } catch (error) {
        throw error;
    }
}

export const getNewestDonate = async (limit: number, campaignId: string) => {
    const donate = await prisma.donation.findMany({
        where: {
            campaignId,
            status: {
                in: ["ACCEPTED", "ACCEPTED_BY_REVISION"]
            }
        },
        select: {
            donorName: true,
            amount: true,
            message: true,
            createdAt: true
        },
        take: limit || 10,
        orderBy: {
            createdAt: "desc"
        }
    })

    return donate.map(item => ({
        ...item,
        createdAt: timeAgo(item.createdAt),
        donorName: item.donorName.toLowerCase() !== "anonymous" ? maskName(item.donorName) : "Anonymous"
    }))
}


export class DonationService {
    private auditService: AuditService;
    constructor() {
        this.auditService = new AuditService();
    }

    async getDonateByCampaignId(
        campaignId: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: DonationStatus
    ) {
        try {

            if (!campaignId) {
                throw new AppError("Campaign ID tidak boleh kosong");
            }

            const currentPage = Math.max(1, page);
            const currentLimit = Math.min(Math.max(1, limit), 100);
            const skip = (currentPage - 1) * currentLimit;
    
            if(status && !Object.values(DonationStatus).includes(status)) {
                throw new AppError("Status tidak ditemukan");
            }
    
            const whereClause: Prisma.DonationWhereInput = {
                campaignId: campaignId,
                ...(search
                    ? {
                        OR: [
                            {
                                donorName: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                message: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    }
                    : {}),
                ...(status
                    ? {
                        status: status,
                    }
                    : {})
            };
    
            const [items, total] = await Promise.all([
                prisma.donation.findMany({
                    where: whereClause,
        
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
        
                skip,
                take: currentLimit,
            }),
        
            prisma.donation.count({
                where: whereClause,
            }),
        ]);
    
        return {
            items,
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit),
        };
        } catch (error) {
            throw error;
        }
    } 

    async getDonateById(id: string) {
        try {
            const donate = await prisma.donation.findUnique({
                where: {
                    id,
                },
            });
            if (!donate) {
                throw new AppError("Donation not found");
            }
            return donate;
        } catch (error) {
            throw error;
        }
    }

    async patchStatus(agent: agentResult, userId: string, id: string, status: DonationStatus, amount?: number, reply?: string | null) {
        try {
            const checkDonate = await prisma.donation.findUnique({
                where: {
                    id,
                }
            });

            if (!checkDonate) {
                throw new AppError("Donation tidak ditemukan", 404);
            }

            if (checkDonate.status !== "PENDING") throw new AppError("Status tidak dapat diubah lagi")

            const payload = {
                acceptedAmount: amount || checkDonate.amount,
                reply,
                status
            }


            return await prisma.$transaction( async(tx) => {
                const result = await tx.donation.update({
                    where: {
                        id,
                    },
                    data: payload
                })
        
                await this.auditService.create(tx, userId, "UPDATE", "donation", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
}