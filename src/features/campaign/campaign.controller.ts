import { RequestCreateCampaignDTO, RequestUpdateCampaignDTO } from './campaign.validate';
import { NextFunction, Request, Response } from "express";
import { CampaignPublicService, CampaignService, DonationCampaignPublicService } from "./campaign.service";
import { sendError, sendSuccess } from "../../utils/response";
import { userAgent } from '../../utils/userAgent';

export const CampaignPublicController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CampaignPublicService();
        return sendSuccess(res, "Data campaign get successfully", result, 200);
    } catch (error) {
        next(error)
    }
}
export const CampaignDonationPublicController = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { campaignId } = req.params
      const result = await DonationCampaignPublicService(campaignId.toString());
      return sendSuccess(res, "Data campaign get successfully", result, 200);
    } catch (error) {
      next(error)
    }
}


export class CampaignController {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  /**
   * GET /campaigns
   * Pagination + Search
   */
  getAllCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, search } = req.query
    
        const data = await this.campaignService.getAllCampaign(
          Number(page || 1) || 1,
          Number(limit || 10) || 10,
          search ? search.toString() : undefined,
        );
    
        return sendSuccess(res, "Data campaign berhasil diambil", data, 200);
    } catch (error) {
        next(error);
    }
  }

  /**
   * GET /campaigns/:id
   */
  getCampaignById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = req.params;
    
        const data = await this.campaignService.getCampaignById(id.toString());
    
        if (!data) {
          return sendError(res, "Campaign tidak ditemukan", null, 404);
        }
    
        return sendSuccess(res, "Data campaign berhasil diambil", data, 200);
    } catch (error) {
        next(error);
    }
  }

  /**
   * POST /campaigns
   */
  createCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = req.user;
        const { startAt, endAt, title, description, targetDonationAmount, sponsorCount }: RequestCreateCampaignDTO = req.body;

        const agent = await userAgent(req)
    
        const data = await this.campaignService.createCampaign(
        agent,
        userData?.userId || "",
        {
          startAt,
          endAt,
          title,
          description,
          targetDonationAmount,
          sponsorCount,
        });
    
        return sendSuccess(res, "Campaign berhasil dibuat", data, 201);
    } catch (error) {
        next(error);
    }
  }

  /**
   * PATCH /campaigns/:id
   */
  updateCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = req.user;
        const { id } = req.params;
    
        const body: RequestUpdateCampaignDTO = req.body;

        const agent = await userAgent(req)
    
        const data = await this.campaignService.updateCampaign(
          agent,
          userData?.userId || "",
          id.toString(),
          body,
        );
    
        return res.status(200).json({
          success: true,
          message: "Campaign berhasil diperbarui",
          data,
        });
    } catch (error) {
        next(error);
    }
  }

  /**
   * DELETE /campaigns/:id
   * Soft delete
   */
  softDeleteCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
    
        const userData = req.user;
        const agent = await userAgent(req)
        const data = await this.campaignService.softDeleteCampaign(agent, userData?.userId || "", id.toString());
    
        return sendSuccess(res, "Campaign berhasil dihapus", data, 200);
    } catch (error) {
        next(error);
    }
  }

  /**
   * PATCH /campaigns/:id/restore
   */
  restoreCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
    
        const userData = req.user;
        const agent = await userAgent(req)
    
        const data = await this.campaignService.restoreCampaign(agent, userData?.userId || "", id.toString());
    
        return sendSuccess(res, "Campaign berhasil dikembalikan", data, 200);
    } catch (error) {
        next(error);
    }
  }

  /**
   * DELETE /campaigns/:id/hard
   * Hard delete
   */
  hardDeleteCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      const userData = req.user;
      const agent = await userAgent(req)

      const data = await this.campaignService.hardDeleteCampaign(agent, userData?.userId || "", id.toString());
      return sendSuccess(res, "Campaign berhasil dihapus permanen", data, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /campaigns/:id/set-active

    return res.status(200).json({
      success: true,
      message: "Campaign berhasil dihapus permanen",
      data,
    });
  }

  /**
   * PATCH /campaigns/:id/set-active
   */
  setActiveCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userData = req.user;
      const agent = await userAgent(req)

      const data = await this.campaignService.setActiveCampaign(agent, userData?.userId || "", id.toString());

      return sendSuccess(res, "Campaign berhasil diaktifkan", data, 200);
    } catch (error) {
      next(error);
    }
  }
}