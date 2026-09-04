import { NextFunction, Request, Response } from "express";
import { RequestCreateDonationDTO } from "./donation.validate";
import { userAgent } from "../../../utils/userAgent";
import { DonationService, getNewestDonate, StoreDonateService } from "./donation.service";
import { sendError, sendSuccess } from "../../../utils/response";
import { createFileTypeSchema } from "../../../types/storage";
import { DonationStatus } from "../../../generated/prisma/enums";

export const StoreDonationController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: RequestCreateDonationDTO = req.body;
        const agent = await userAgent(req);

        const file = req.file;
        if (!file) {
            return sendError(res, "File bukti tidak ditemukan", undefined, 404)
        }

        const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }

        const result = await StoreDonateService(agent, body, file);

        return sendSuccess(res, "Berhasil mengirimkan donasi, terimakasih atas bantuan anda", result, 201)
    } catch (error) {
        next(error)
    }
}
export const getDonationHome = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { campaignId } = req.params;
        const { limit } = req.query;

        const result = await getNewestDonate(Number(limit || 8) || 8, campaignId.toString());

        return sendSuccess(res, "Donasi berhasil didapatkan", result, 201)
    } catch (error) {
        next(error)
    }
}

export class DonationController {
    private donationService: DonationService;

    constructor() {
        this.donationService = new DonationService();
    }

    getDonationByCampaignId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { campaignId } = req.params;
            const { page, limit, search, status } = req.query;

            const proposals = await this.donationService.getDonateByCampaignId(campaignId.toString(), Number(page || 1) || 1, Number(limit || 10) || 10, search ? search.toString() : undefined, status ? status.toString() as DonationStatus : undefined);

            return sendSuccess(res, "Data donasi berhasil diambil", proposals, 200);
        } catch (error) {
            next(error);
        }
    }
    getDonationById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const proposals = await this.donationService.getDonateById(id.toString());

            return sendSuccess(res, "Data donasi berhasil diambil", proposals, 200);
        } catch (error) {
            next(error);
        }
    }
    patchDonation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userData = req.user;
            const { status, amount, reply }: { status: DonationStatus, amount?: number | null, reply?: string | null } = req.body;
            const agent = await userAgent(req);

            const result = await this.donationService.patchStatus(agent, userData?.userId || "", id.toString(), status || "ACCEPTED", amount ? Number(amount) : undefined, reply);

            return sendSuccess(res, "Berhasil mengubah data donasi", result, 201)
        } catch (error) {
            next(error)
        }
    }
}