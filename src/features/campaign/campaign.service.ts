import { CampaignStatus, Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma"
import { PaginationResponse } from "../../types/response.type";
import { AppError } from "../../utils/AppError";
import { agentResult } from "../../utils/userAgent";
import { AuditService } from "../audit/service";
import type {
  RequestCreateCampaignDTO,
  RequestUpdateCampaignDTO,
} from "./campaign.validate";

export const CampaignPublicService = async () => {
    const now = new Date();
    const data = await prisma.campaigns.findFirst({
        where: {
            status: "ACTIVE",
            deletedAt: null,
        },
        select: {
            id: true,
            title: true,
            description: true,
            startAt: true,
            endAt: true,
            targetDonationAmount: true,
            sponsorCount: true,
            
            homePageSection: {
                select: {
                    heroBgImage: true,
                    heroTagline: true,
                    heroTitle: true,
                    heroDescription: true,

                    whyHomeDescription: true,
                    whySection: {
                        select: {
                            icon: true,
                            title: true,
                            subTitle: true
                        }
                    },

                    supportWorkTagline: true,
                    supportWorkDescription: true,

                    supportWorkSection: {
                        select: {
                            order: true,
                            icon: true,
                            title: true,
                            description: true,
                            focus: true
                        },
                        orderBy: {
                            order: "asc"
                        }
                    },

                    ctaSectionBgImage: true,
                    ctaSectionTagline: true,
                    ctaSectionTitle: true,
                    ctaSectionSubtitle: true,
                }
            },

            aboutUsSection: {
                select: {
                    heroBgImage: true,
                    heroTagline: true,
                    heroTitle: true,
                    heroDescription: true,
                    vision: true,
                    mission: true,

                    CampaignTim: {
                        select: {
                            image: true,
                            name: true,
                            position: true,
                            instagram: true,
                            linkedin: true
                        }
                    },

                    WorkStructureDivision: {
                        select: {
                            divisionName: true,
                            divisionJobDescription: true,
                        }
                    }
                }

            },
        }
    })
    if (!data) return null

    let eventStatus: "NOT_STARTED" | "ACTIVE" | "ENDED";
    if (now < data.startAt) {
        eventStatus = "NOT_STARTED";
    } else if (now > data.endAt) {
        eventStatus = "ENDED";
    } else {
        eventStatus = "ACTIVE";
    }

    return {
        ...data,
        status: eventStatus
    };
}
export const DonationCampaignPublicService = async (campaignId: string) => {
    const campaign = await prisma.campaigns.findUnique({
        where: {
            id: campaignId
        },
        select: {
          targetDonationAmount: true,
          sponsorCount: true,
        }
    })
    if (!campaign) throw new AppError("Campaign tidak ditemukan", 404)

    const donation = await prisma.donation.aggregate({
      where: {
        campaignId
      },
      _sum: {
        acceptedAmount: true
      }
    })

    const donatur = await prisma.donation.count({ where: { campaignid } })

    return {
      target: campaign.targetDonationAmount,
      collected: Number(donation._sum.acceptedAmount || 0) || 0,
      donateCount: Number(donatur || 0)
      sponsor: campaign.sponsorCount
    };
}

export class CampaignService {

  private auditService: AuditService;
  
  constructor() {
    this.auditService = new AuditService();
  }

  async getAllCampaign(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<PaginationResponse<any>> {
    const currentPage = Math.max(1, page);
    const currentLimit = Math.min(Math.max(1, limit), 100);

    const skip = (currentPage - 1) * currentLimit;

    const whereClause: Prisma.CampaignsWhereInput = {
      deletedAt: null,

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
    };

    const [items, total] = await Promise.all([
      prisma.campaigns.findMany({
        where: whereClause,

        orderBy: [
          {
            status: "asc",
          },
          {
            createdAt: "desc",
          },
        ],

        skip,
        take: currentLimit,
      }),

      prisma.campaigns.count({
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
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: string) {
    return await prisma.campaigns.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Create campaign
   */
  async createCampaign(agent: agentResult, userId: string, data: RequestCreateCampaignDTO) {
    try {
        return await prisma.$transaction( async (tx) => {
            const campaign = await tx.campaigns.create({
              data: {
                startAt: data.startAt,
                endAt: data.endAt,
                title: data.title,
                description: data.description,
                targetDonationAmount: data.targetDonationAmount,
                sponsorCount: data.sponsorCount,
        
                status: CampaignStatus.INACTIVE,
              },
            });

            await this.auditService.create(tx, userId, "CREATE", "campaign", campaign.id, agent, campaign)
        
            return campaign;
        })
    } catch (error) {
        throw error;
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    agent: agentResult,
    userId: string,
    id: string,
    data: RequestUpdateCampaignDTO,
  ) {
    try {
        const existing = await prisma.campaigns.findFirst({
          where: {
            id,
            deletedAt: null,
          },
        });
    
        if (!existing) {
          throw new AppError("Campaign tidak ditemukan");
        }
    
        const startAt = data.startAt ?? existing.startAt;
        const endAt = data.endAt ?? existing.endAt;
    
        if (endAt <= startAt) {
          throw new AppError(
            "End date harus lebih besar dari start date",
          );
        }

        return await prisma.$transaction(async (tx) => {
            const campaignResult = await tx.campaigns.update({
                where: {
                    id,
                },
            
                data: {
                    ...(data.startAt !== undefined && {
                    startAt: data.startAt,
                    }),
            
                    ...(data.endAt !== undefined && {
                    endAt: data.endAt,
                    }),
            
                    ...(data.title !== undefined && {
                    title: data.title,
                    }),
            
                    ...(data.description !== undefined && {
                    description: data.description,
                    }),
            
                    ...(data.targetDonationAmount !== undefined && {
                    targetDonationAmount: data.targetDonationAmount,
                    }),
            
                    ...(data.sponsorCount !== undefined && {
                    sponsorCount: data.sponsorCount,
                    }),
                },
            });

            await this.auditService.create(tx, userId, "UPDATE", "campaign", campaignResult.id, agent, campaignResult);

            return campaignResult;
        })
    } catch (error) {
        throw error;
    }
  }

  /**
   * Soft delete
   */
  async softDeleteCampaign(agent: agentResult, userId: string, id: string) {
    const existing = await prisma.campaigns.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new AppError("Campaign tidak ditemukan");
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const campaign = await tx.campaigns.update({
                where: {
                    id,
                },
            
                data: {
                    deletedAt: new Date(),
                    status: CampaignStatus.INACTIVE,
                },
            });

            await this.auditService.create(tx, userId, "DELETE", "campaign", campaign.id, agent, campaign);
            return campaign;
        })
    } catch (error) {
        throw error;
    }

  }

  /**
   * Restore campaign
   */
  async restoreCampaign(agent: agentResult, userId: string, id: string) {
    const existing = await prisma.campaigns.findFirst({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!existing) {
      throw new AppError("Campaign tidak ditemukan");
    }

    try {

        return await prisma.$transaction(async (tx) => {
            const campaign = await tx.campaigns.update({
                where: {
                    id,
                },

                data: {
                    deletedAt: null,
                    status: CampaignStatus.INACTIVE,
                },
            });

            await this.auditService.create(tx, userId, "UPDATE", "campaign", campaign.id, agent, campaign);

            return campaign;
        });
    } catch (error) {
        throw error;
    }

  }

  /**
   * Hard delete
   */
  async hardDeleteCampaign(agent: agentResult, userId: string, id: string) {
    const existing = await prisma.campaigns.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new AppError("Campaign tidak ditemukan");
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const campaign = await tx.campaigns.delete({
                where: {
                    id,
                },
            });

            await this.auditService.create(tx, userId, "DELETE", "campaign", campaign.id, agent, campaign);

            return campaign;
        })
    } catch (error) {
        throw error;
    }

  }

  /**
   * Set campaign menjadi ACTIVE
   *
   * Hanya boleh ada satu campaign ACTIVE.
   */
  async setActiveCampaign(agent: agentResult, userId: string, id: string) {
    return await prisma.$transaction(
      async (tx) => {
        const campaign = await tx.campaigns.findFirst({
          where: {
            id,
            deletedAt: null,
          },
        });

        if (!campaign) {
          throw new AppError("Campaign tidak ditemukan");
        }

        /**
         * Matikan semua campaign ACTIVE
         */
        await tx.campaigns.updateMany({
          where: {
            status: CampaignStatus.ACTIVE,
            deletedAt: null,

            // Jangan perlu update campaign yang sama
            id: {
              not: id,
            },
          },

          data: {
            status: CampaignStatus.INACTIVE,
          },
        });

        await this.auditService.create(tx, userId, "UPDATE", "campaign", id, agent, campaign);

        /**
         * Aktifkan campaign yang dipilih
         */
        return await tx.campaigns.update({
          where: {
            id,
          },

          data: {
            status: CampaignStatus.ACTIVE,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}