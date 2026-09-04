import { NextFunction, Request, Response } from "express";
import { userAgent } from "../../../utils/userAgent";
import { ContactType } from "../../../generated/prisma/browser";
import { sendSuccess } from "../../../utils/response";
import { ContactService, PublicService } from "./contact.service";
import { RequestCreateContactDTO } from "./contact.validate";

export const PublicController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { campaignId } = req.params;
        const result = await PublicService(campaignId.toString())
        return sendSuccess(res, "Data berhasil diambil", result, 200)
    } catch (error) {
        next(error)
    }
}

export class DataController {
    private contactService: ContactService;

    constructor() {
        this.contactService = new ContactService();
    }

    getByCampaignId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { campaignId } = req.params;
            const { page, limit, search, type } = req.query;

            const result = await this.contactService.getByCampaignId(campaignId.toString(), Number(page || 1) || 1, Number(limit || 10) || 10, search ? search.toString() : undefined, type ? type.toString() as ContactType : undefined);

            return sendSuccess(res, "Data contact berhasil diambil", result, 200);
        } catch (error) {
            next(error);
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.contactService.getById(id.toString());

            return sendSuccess(res, "Data contact berhasil diambil", result, 200);
        } catch (error) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
            const userData = req.user;
            const data: RequestCreateContactDTO = req.body;

            const result = await this.contactService.create(agent, userData?.userId || "", data);

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
            const data: RequestCreateContactDTO = req.body;

            const result = await this.contactService.update(agent, userData?.userId || "", id.toString(), data);

            return sendSuccess(res, "Data berhasil diperbarui", result, 200);
        } catch (error) {
            next(error);
        }
    }
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const agent = await userAgent(req);
            const userData = req.user;

            const result = await this.contactService.delete(agent, userData?.userId || "", id.toString());

            return sendSuccess(res, "Data berhasil dihapus", result, 200);
        } catch (error) {
            next(error);
        }
    }
}