import { NextFunction, Request, Response } from "express";
import { SiteSettingPublic, SiteSettingService } from "./site-setting.service";
import { sendError, sendSuccess } from "../../utils/response";
import { userAgent } from "../../utils/userAgent";
import { createFileTypeSchema } from "../../types/storage";

export const SiteSettingPublicController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await SiteSettingPublic();
        return sendSuccess(res, "Data site setting get successfully", result, 200);
    } catch (error) {
        next(error)
    }
}

export class SiteSetting {
    private siteService: SiteSettingService;

    constructor() {
        this.siteService = new SiteSettingService();
    }

    get = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.siteService.get();
            return sendSuccess(res, "Data site setting get successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }
    getByKey = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { key } = req.params;
            const result = await this.siteService.getByKey(key.toString());
            return sendSuccess(res, "Data site setting get successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }
    updateValue = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { key, value } = req.body;
            if (!key || !value) return sendError(res, "Key atau value tidak boleh kosong", undefined, 422);

            const agent = await userAgent(req);
            const result = await this.siteService.update(agent, key.toString(), value.toString(), null);
            return sendSuccess(res, "Data site berhasil diperbarui", result, 200);
        } catch (error) {
            next(error)
        }
    }
    updateLogo = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;
            if (!file) {
                return sendError(res, "File logo tidak ditemukan", undefined, 404)
            }

            const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
            const fileSchema = createFileTypeSchema(allowedMime);
            const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

            if (!validation.success) {
                return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
            }

            const agent = await userAgent(req);
            const result = await this.siteService.update(agent, "app.logo", null, file);
            return sendSuccess(res, "Data site berhasil diperbarui", result, 200);
        } catch (error) {
            next(error)
        }
    }
}