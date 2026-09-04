import { Prisma, ProposalStatus } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { storageService } from "../../../lib/storage.service";
import { AppError } from "../../../utils/AppError";
import { agentResult } from "../../../utils/userAgent";
import { AuditService } from "../../audit/service";
import { RequestCreateCampaignProposalDTO } from "./proposal.validate";

export const ProposalPublicService = async (campaignId: string) => {
    if (!campaignId) {
        return []
    }

    return await prisma.campaignProposal.findMany({
        where: {
            status: "PUBLISHED"
        },
        orderBy: [
            {
                createdAt: "desc",
            },
        ],
    })
}

export class ProposalService {
    private auditService: AuditService;

    constructor() {
        this.auditService = new AuditService();
    }


    async getProposalByCampaignId(
        campaignId: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: ProposalStatus
    ) {
        try {

            if (!campaignId) {
                throw new AppError("Campaign ID tidak boleh kosong");
            }

            const currentPage = Math.max(1, page);
            const currentLimit = Math.min(Math.max(1, limit), 100);
            const skip = (currentPage - 1) * currentLimit;
    
            if(status && !Object.values(ProposalStatus).includes(status)) {
                throw new AppError("Status tidak ditemukan");
            }
    
            const whereClause: Prisma.CampaignProposalWhereInput = {
                campaignId: campaignId,
                ...(search
                    ? {
                        OR: [
                        {
                            title: {
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
                ...(status
                    ? {
                        status: status,
                    }
                    : {})
            };
    
            const [items, total] = await Promise.all([
                prisma.campaignProposal.findMany({
                    where: whereClause,
        
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
        
                skip,
                take: currentLimit,
            }),
        
            prisma.campaignProposal.count({
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

    async getProposalById(id: string) {
        try {
            const proposal = await prisma.campaignProposal.findUnique({
                where: {
                    id,
                },
            });
            if (!proposal) {
                throw new AppError("Proposal not found");
            }
            return proposal;
        } catch (error) {
            throw error;
        }
    }

    async createProposal(agent: agentResult, userId: string, data: RequestCreateCampaignProposalDTO, file: Express.Multer.File) {
        try {
            const proposalFile = await storageService.upload(file.buffer, file.mimetype, {
                folder: 'proposals',
            });

            return await prisma.$transaction( async(tx) => {
                const result = await tx.campaignProposal.create({
                    data: {
                        ...data,
                        proposalPdfUrl: proposalFile,
                    }
                })
        
                await this.auditService.create(tx, userId, "CREATE", "proposal", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async updateProposal(agent: agentResult, userId: string, id: string, data: RequestCreateCampaignProposalDTO, file?: Express.Multer.File | null) {
        try {
            const checkProposal = await prisma.campaignProposal.findUnique({
                where: {
                    id,
                }
            });

            if (!checkProposal) {
                throw new AppError("Proposal tidak ditemukan", 404);
            }

            const payload = {
                ...data,
                proposalPdfUrl: checkProposal.proposalPdfUrl,
            }

            if (file) {
                const proposalFile = await storageService.upload(file.buffer, file.mimetype, {
                    folder: 'proposals',
                });
                payload.proposalPdfUrl = proposalFile;
            }


            return await prisma.$transaction( async(tx) => {
                const result = await tx.campaignProposal.update({
                    where: {
                        id,
                    },
                    data: payload
                })
        
                await this.auditService.create(tx, userId, "UPDATE", "proposal", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async deleteProposal(agent: agentResult, userId: string, id: string) {
        try {
            const checkProposal = await prisma.campaignProposal.findUnique({
                where: {
                    id,
                }
            });

            if (!checkProposal) {
                throw new AppError("Proposal tidak ditemukan", 404);
            }

            return await prisma.$transaction( async(tx) => {
                const result = await tx.campaignProposal.delete({
                    where: {
                        id,
                    }
                })
        
                await this.auditService.create(tx, userId, "DELETE", "proposal", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
}