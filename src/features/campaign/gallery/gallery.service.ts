import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { storageService } from "../../../lib/storage.service";
import { AppError } from "../../../utils/AppError";
import { agentResult } from "../../../utils/userAgent";
import { AuditService } from "../../audit/service";
import { RequestCreateGalleryDTO } from "./gallery.validate";

export const GalleryPublicService = async (campaignId: string) => {
    if (!campaignId) {
        return []
    }

    return await prisma.gallery.findMany({
        where: {
            campaignId
        },
        orderBy: [
            {
                timeStamp: "desc",
            },
        ],
    })
}

export class GalleryService {
    private auditService: AuditService;

    constructor() {
        this.auditService = new AuditService();
    }


    async getGalleryByCampaignId(
        campaignId: string,
        page: number = 1,
        limit: number = 10,
        search?: string
    ) {
        try {

            if (!campaignId) {
                throw new AppError("Campaign ID tidak boleh kosong");
            }

            const currentPage = Math.max(1, page);
            const currentLimit = Math.min(Math.max(1, limit), 100);
            const skip = (currentPage - 1) * currentLimit;
    
    
            const whereClause: Prisma.GalleryWhereInput = {
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
            };
    
            const [items, total] = await Promise.all([
                prisma.gallery.findMany({
                    where: whereClause,
        
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
        
                skip,
                take: currentLimit,
            }),
        
            prisma.gallery.count({
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

    async getGalleryById(id: string) {
        try {
            const galeri = await prisma.gallery.findUnique({
                where: {
                    id,
                },
            });
            if (!galeri) {
                throw new AppError("Galeri not found");
            }
            return galeri;
        } catch (error) {
            throw error;
        }
    }

    async createGallery(agent: agentResult, userId: string, data: RequestCreateGalleryDTO, image: Express.Multer.File, video?: Express.Multer.File | null) {
        try {
            const thumbnail = await storageService.upload(image.buffer, image.mimetype, {
                folder: 'gallery',
            });

            let videoUrl: string | null = null;

            if (data.galleryType === "VIDEO") {
                if (!video) throw new AppError("Video tidak boleh kosong")

                videoUrl = await storageService.upload(video.buffer, video.mimetype, {
                    folder: 'gallery'
                })
            }

            return await prisma.$transaction( async(tx) => {
                const result = await tx.gallery.create({
                    data: {
                        ...data,
                        imageUrl: thumbnail,
                        videoUrl
                    }
                })
        
                await this.auditService.create(tx, userId, "CREATE", "gallery", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async updateGallery(agent: agentResult, userId: string, id: string, data: RequestCreateGalleryDTO, image?: Express.Multer.File | null, video?: Express.Multer.File | null) {
        try {
            const checkGallery = await prisma.gallery.findUnique({
                where: {
                    id,
                }
            });

            if (!checkGallery) {
                throw new AppError("Galeri tidak ditemukan", 404);
            }

            const payload = {
                ...data,
                imageUrl: checkGallery.imageUrl,
                videoUrl: checkGallery.videoUrl
            }

            if (image) {
                const thumbnail = await storageService.upload(image.buffer, image.mimetype, {
                    folder: 'gallery',
                });
                payload.imageUrl= thumbnail;
            }

            if (data.galleryType === "VIDEO") {
                if (!checkGallery.videoUrl && !video) throw new AppError("Video tidak boleh kosong")

                if (video) {
                    const videoUrl = await storageService.upload(video.buffer, video.mimetype, {
                        folder: 'gallery'
                    })
                    payload.videoUrl = videoUrl
                }
            }



            return await prisma.$transaction( async(tx) => {
                const result = await tx.gallery.update({
                    where: {
                        id,
                    },
                    data: payload
                })
        
                await this.auditService.create(tx, userId, "UPDATE", "gallery", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
    async deleteGallery(agent: agentResult, userId: string, id: string) {
        try {
            const checkGallery = await prisma.gallery.findUnique({
                where: {
                    id,
                }
            });

            if (!checkGallery) {
                throw new AppError("Galeri tidak ditemukan", 404);
            }

            return await prisma.$transaction( async(tx) => {
                const result = await tx.gallery.delete({
                    where: {
                        id,
                    }
                })
        
                await this.auditService.create(tx, userId, "DELETE", "gallery", result.id, agent, result)
                return result;
            } )
        } catch (error) {
            throw error;
        }
    }
}