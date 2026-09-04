import { ContactType, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../utils/AppError";
import { agentResult } from "../../../utils/userAgent";
import { AuditService } from "../../audit/service";
import { RequestCreateContactDTO } from "./contact.validate";

export const PublicService = async (campaignId: string) => {
    if (!campaignId) {
        return []
    }

    return await prisma.contactList.findMany({
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

export class ContactService {
    private auditService: AuditService;

    constructor() {
        this.auditService = new AuditService();
    }


    async getByCampaignId(
        campaignId: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
        type?: ContactType
    ) {
        try {

            if (!campaignId) {
                throw new AppError("Campaign ID tidak boleh kosong");
            }

            const currentPage = Math.max(1, page);
            const currentLimit = Math.min(Math.max(1, limit), 100);
            const skip = (currentPage - 1) * currentLimit;
    
            if(type && !Object.values(ContactType).includes(type)) {
                throw new AppError("Status tidak ditemukan");
            }
    
            const whereClause: Prisma.ContactListWhereInput = {
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
                            role: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            phone: {
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
                prisma.contactList.findMany({
                    where: whereClause,
        
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
        
                skip,
                take: currentLimit,
            }),
        
            prisma.contactList.count({
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
            const response = await prisma.contactList.findUnique({
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

    async create(agent: agentResult, userId: string, data: RequestCreateContactDTO) {
        try {
            return await prisma.$transaction( async(tx) => {
                const result = await tx.contactList.create({
                    data
                })
        
                await this.auditService.create(tx, userId, "CREATE", "contact-list", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async update(agent: agentResult, userId: string, id: string, data: RequestCreateContactDTO) {
        try {
            const lastData = await prisma.contactList.findUnique({
                where: {
                    id,
                }
            });

            if (!lastData) {
                throw new AppError("Contact tidak ditemukan", 404);
            }

            return await prisma.$transaction( async(tx) => {
                const result = await tx.contactList.update({
                    where: {
                        id,
                    },
                    data
                })
        
                await this.auditService.create(tx, userId, "UPDATE", "contact-list", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async delete(agent: agentResult, userId: string, id: string) {
        try {
            const lastData = await prisma.contactList.findUnique({
                where: {
                    id,
                }
            });

            if (!lastData) {
                throw new AppError("Contact tidak ditemukan", 404);
            }

            return await prisma.$transaction( async(tx) => {
                const result = await tx.contactList.delete({
                    where: {
                        id,
                    }
                })
        
                await this.auditService.create(tx, userId, "DELETE", "contact-list", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
}