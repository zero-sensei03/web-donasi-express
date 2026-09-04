import { NextFunction, Request, Response } from "express";
import { ProposalPublicService, ProposalService } from "./proposal.service";
import { userAgent } from "../../../utils/userAgent";
import { ProposalStatus } from "../../../generated/prisma/browser";
import { sendError, sendSuccess } from "../../../utils/response";
import { createFileTypeSchema } from "../../../types/storage";

export const ProposalPublicController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { campaignId } = req.params;
        const result = await ProposalPublicService(campaignId.toString())
        return sendSuccess(res, "Data proposal berhasil diambil", result, 200)
    } catch (error) {
        next(error)
    }
}

export class ProposalController {
    private proposalService: ProposalService;

    constructor() {
        this.proposalService = new ProposalService();
    }

    getProposalByCampaignId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { campaignId } = req.params;
            const { page, limit, search, status } = req.query;

            const proposals = await this.proposalService.getProposalByCampaignId(campaignId.toString(), Number(page || 1) || 1, Number(limit || 10) || 10, search ? search.toString() : undefined, status ? status.toString() as ProposalStatus : undefined);

            return sendSuccess(res, "Data proposal berhasil diambil", proposals, 200);
        } catch (error) {
            next(error);
        }
    }

    getProposalById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const proposal = await this.proposalService.getProposalById(id.toString());

            return sendSuccess(res, "Data proposal berhasil diambil", proposal, 200);
        } catch (error) {
            next(error);
        }
    }

    createProposal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
            const userData = req.user;
            const data = req.body;
            const file = req.file;

            if (!file) {
                return sendError(res, "File proposal tidak ditemukan", undefined, 404)
            }

            const allowedMime = ['application/pdf'];
            const fileSchema = createFileTypeSchema(allowedMime);
            const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

            if (!validation.success) {
                return sendError(res, "File proposal tidak valid", undefined, 400);
            }

            const proposal = await this.proposalService.createProposal(agent, userData?.userId || "", data, file);

            return sendSuccess(res, "Proposal berhasil dibuat", proposal, 201);
        } catch (error) {
            next(error);
        }
    }
    updateProposal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const agent = await userAgent(req);
            const userData = req.user;
            const data = req.body;
            const file = req.file;

            if (file) {
                const allowedMime = ['application/pdf'];
                const fileSchema = createFileTypeSchema(allowedMime);
                const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

                if (!validation.success) {
                    return sendError(res, "File proposal tidak valid", undefined, 400);
                }
            }



            const proposal = await this.proposalService.updateProposal(agent, userData?.userId || "", id.toString(), data, file);

            return sendSuccess(res, "Proposal berhasil diperbarui", proposal, 200);
        } catch (error) {
            next(error);
        }
    }
    deleteProposal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const agent = await userAgent(req);
            const userData = req.user;

            const proposal = await this.proposalService.deleteProposal(agent, userData?.userId || "", id.toString());

            return sendSuccess(res, "Proposal berhasil dihapus", proposal, 200);
        } catch (error) {
            next(error);
        }
    }
}