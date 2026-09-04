import { NextFunction, Request, Response } from "express";
import { userAgent } from "../../../utils/userAgent";
import { sendError, sendSuccess } from "../../../utils/response";
import { createFileTypeSchema } from "../../../types/storage";
import { GalleryPublicService, GalleryService } from "./gallery.service";

export const GalleryPublicController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { campaignId } = req.params;
        const result = await GalleryPublicService(campaignId.toString())
        return sendSuccess(res, "Data galeri berhasil diambil", result, 200)
    } catch (error) {
        next(error)
    }
}

export class GalleryController {
    private galleryService: GalleryService;

    constructor() {
        this.galleryService = new GalleryService();
    }

    getGalleryByCampaignId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { campaignId } = req.params;
            const { page, limit, search } = req.query;

            const galleries = await this.galleryService.getGalleryByCampaignId(campaignId.toString(), Number(page || 1) || 1, Number(limit || 10) || 10, search ? search.toString() : undefined);

            return sendSuccess(res, "Data galeri berhasil diambil", galleries, 200);
        } catch (error) {
            next(error);
        }
    }

    getGalleryById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const gallery = await this.galleryService.getGalleryById(id.toString());

            return sendSuccess(res, "Data galeri berhasil diambil", gallery, 200);
        } catch (error) {
            next(error);
        }
    }

    createGallery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
            const userData = req.user;
            const data = req.body;

            const files = req.files as {
                image?: Express.Multer.File[];
                video?: Express.Multer.File[];
            };

            const image = files.image?.[0];
            const video = files.video?.[0];

            if (!image) {
                return sendError(res, "File image tidak ditemukan", undefined, 404)
            }

            const imageSchema = createFileTypeSchema([
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
            ]);

            const validation = imageSchema.safeParse({
                mimetype: image.mimetype,
                buffer: image.buffer,
            });

            if (!validation.success) {
                return sendError(
                    res,
                    "File image tidak valid",
                    undefined,
                    400,
                );
            }

            if (video) {
                const videoSchema = createFileTypeSchema([
                    "video/mp4",
                    "video/webm",
                    "video/quicktime",
                ]);

                const validationVideo = videoSchema.safeParse({
                    mimetype: video.mimetype,
                    buffer: video.buffer,
                });

                if (!validationVideo.success) {
                    return sendError(
                        res,
                        "File video tidak valid",
                        undefined,
                        400,
                    );
                }
            }

            const proposal = await this.galleryService.createGallery(agent, userData?.userId || "", data, image, video);

            return sendSuccess(res, "Galeri berhasil dibuat", proposal, 201);
        } catch (error) {
            next(error);
        }
    }
    updateGallery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const agent = await userAgent(req);
            const userData = req.user;
            const data = req.body;

            const files = req.files as {
                image?: Express.Multer.File[];
                video?: Express.Multer.File[];
            };

            const image = files.image?.[0];
            const video = files.video?.[0];

            if (image) {
                const imageSchema = createFileTypeSchema([
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                ]);
    
                const validation = imageSchema.safeParse({
                    mimetype: image.mimetype,
                    buffer: image.buffer,
                });
    
                if (!validation.success) {
                    return sendError(
                        res,
                        "File image tidak valid",
                        undefined,
                        400,
                    );
                }
            }


            if (video) {
                const videoSchema = createFileTypeSchema([
                    "video/mp4",
                    "video/webm",
                    "video/quicktime",
                ]);

                const validationVideo = videoSchema.safeParse({
                    mimetype: video.mimetype,
                    buffer: video.buffer,
                });

                if (!validationVideo.success) {
                    return sendError(
                        res,
                        "File video tidak valid",
                        undefined,
                        400,
                    );
                }
            }



            const proposal = await this.galleryService.updateGallery(agent, userData?.userId || "", id.toString(), data, image, video);

            return sendSuccess(res, "Galeri berhasil diperbarui", proposal, 200);
        } catch (error) {
            next(error);
        }
    }
    deleteGallery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const agent = await userAgent(req);
            const userData = req.user;

            const gallery = await this.galleryService.deleteGallery(agent, userData?.userId || "", id.toString());

            return sendSuccess(res, "Galeri berhasil dihapus", gallery, 200);
        } catch (error) {
            next(error);
        }
    }
}