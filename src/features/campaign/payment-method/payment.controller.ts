import { NextFunction, Request, Response } from "express";
import { userAgent } from "../../../utils/userAgent";
import { PaymentMethodType } from "../../../generated/prisma/browser";
import { sendError, sendSuccess } from "../../../utils/response";
import { createFileTypeSchema } from "../../../types/storage";
import { PaymentService, PublicService } from "./payment.service";

export const PublicController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { campaignId } = req.params;
        const result = await PublicService(campaignId.toString())
        return sendSuccess(res, "Data berhasil diambil", result, 200)
    } catch (error) {
        next(error)
    }
}

export class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    getByCampaignId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { campaignId } = req.params;
            const { page, limit, search, type } = req.query;

            const result = await this.paymentService.getByCampaignId(campaignId.toString(), Number(page || 1) || 1, Number(limit || 10) || 10, search ? search.toString() : undefined, type ? type.toString() as PaymentMethodType : undefined);

            return sendSuccess(res, "Data payment berhasil diambil", result, 200);
        } catch (error) {
            next(error);
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.paymentService.getById(id.toString());

            return sendSuccess(res, "Data payment berhasil diambil", result, 200);
        } catch (error) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
            const userData = req.user;
            const data = req.body;
            const file = req.file;

            if (data.type === "QRIS") {
                if (!file) {
                    return sendError(res, "File qris tidak ditemukan", undefined, 404)
                }
                const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
                const fileSchema = createFileTypeSchema(allowedMime);
                const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });
    
                if (!validation.success) {
                    return sendError(res, "File qris tidak valid", undefined, 400);
                }
            }


            const result = await this.paymentService.create(agent, userData?.userId || "", data, file);

            return sendSuccess(res, "Data berhasil dibuat", result, 201);
        } catch (error) {
            next(error);
        }
    }
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const agent = await userAgent(req);
            const userData = req.user;
            const data = req.body;
            const file = req.file;

            if (data.type === "QRIS") {
                if (file) {
                    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
                    const fileSchema = createFileTypeSchema(allowedMime);
                    const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });
    
                    if (!validation.success) {
                        return sendError(res, "File qris tidak valid", undefined, 400);
                    }
                }
            }

            const result = await this.paymentService.update(agent, userData?.userId || "", id.toString(), data, file);

            return sendSuccess(res, "Payment berhasil diperbarui", result, 200);
        } catch (error) {
            next(error);
        }
    }
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const agent = await userAgent(req);
            const userData = req.user;

            const result = await this.paymentService.delete(agent, userData?.userId || "", id.toString());

            return sendSuccess(res, "Payment berhasil dihapus", result, 200);
        } catch (error) {
            next(error);
        }
    }
}