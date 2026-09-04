import { PaymentMethodType, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { storageService } from "../../../lib/storage.service";
import { AppError } from "../../../utils/AppError";
import { agentResult } from "../../../utils/userAgent";
import { AuditService } from "../../audit/service";
import { RequestCreatePaymentMethodDTO } from "./payment.validate";

export const PublicService = async (campaignId: string) => {
    if (!campaignId) {
        return []
    }

    return await prisma.paymentMethod.findMany({
        where: {
            campaignId,
        },
        orderBy: [
            {
                createdAt: "desc",
            },
        ],
    })
}

export class PaymentService {
    private auditService: AuditService;

    constructor() {
        this.auditService = new AuditService();
    }


    async getByCampaignId(
        campaignId: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
        type?: PaymentMethodType
    ) {
        try {

            if (!campaignId) {
                throw new AppError("Campaign ID tidak boleh kosong");
            }

            const currentPage = Math.max(1, page);
            const currentLimit = Math.min(Math.max(1, limit), 100);
            const skip = (currentPage - 1) * currentLimit;
    
            if(type && !Object.values(PaymentMethodType).includes(type)) {
                throw new AppError("Status tidak ditemukan");
            }
    
            const whereClause: Prisma.PaymentMethodWhereInput = {
                campaignId: campaignId,
                ...(search
                    ? {
                        OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            accountNumber: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            bankName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        ],
                    }
                    : {}),
                ...(type
                    ? {
                        type: type,
                    }
                    : {})
            };
    
            const [items, total] = await Promise.all([
                prisma.paymentMethod.findMany({
                    where: whereClause,
        
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
        
                skip,
                take: currentLimit,
            }),
        
            prisma.paymentMethod.count({
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

    async getById(id: string) {
        try {
            const response = await prisma.paymentMethod.findUnique({
                where: {
                    id,
                },
            });
            if (!response) {
                throw new AppError("Data not found");
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async create(agent: agentResult, userId: string, data: RequestCreatePaymentMethodDTO, file?: Express.Multer.File | null) {
        try {
            const payload: RequestCreatePaymentMethodDTO & { qrisImage: string | null } = {
                ...data,
                qrisImage: null
            }
            if (file) {
                const saveFile = await storageService.upload(file.buffer, file.mimetype, {
                    folder: 'payment-method',
                });

                payload.qrisImage = saveFile
            }

            return await prisma.$transaction( async(tx) => {
                const result = await tx.paymentMethod.create({
                    data: payload
                })
        
                await this.auditService.create(tx, userId, "CREATE", "payment-method", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async update(agent: agentResult, userId: string, id: string, data: RequestCreatePaymentMethodDTO, file?: Express.Multer.File | null) {
        try {
            const lastData = await prisma.paymentMethod.findUnique({
                where: {
                    id,
                }
            });

            if (!lastData) {
                throw new AppError("Payment method tidak ditemukan", 404);
            }

            const payload: RequestCreatePaymentMethodDTO & { qrisImage: string | null } = {
                ...data,
                qrisImage: lastData.qrisImage,
            }

            if (file) {
                const saveFile = await storageService.upload(file.buffer, file.mimetype, {
                    folder: 'payment-method',
                });
                payload.qrisImage = saveFile;
            }


            return await prisma.$transaction( async(tx) => {
                const result = await tx.paymentMethod.update({
                    where: {
                        id,
                    },
                    data: payload
                })
        
                await this.auditService.create(tx, userId, "UPDATE", "payment-method", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async delete(agent: agentResult, userId: string, id: string) {
        try {
            const lastData = await prisma.paymentMethod.findUnique({
                where: {
                    id,
                }
            });

            if (!lastData) {
                throw new AppError("Payment method tidak ditemukan", 404);
            }

            return await prisma.$transaction( async(tx) => {
                const result = await tx.paymentMethod.delete({
                    where: {
                        id,
                    }
                })
        
                await this.auditService.create(tx, userId, "DELETE", "payment-method", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
}