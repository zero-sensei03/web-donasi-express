import { NextFunction, Request, Response } from "express";
import { AboutService } from "./about.service";
import { userAgent } from "../../../../utils/userAgent";
import { sendError, sendSuccess } from "../../../../utils/response";
import { RequestCreateCampaignTimDTO, RequestCreateWorkStructureDTO, RequestUpsertAboutUsDTO } from "./about.validate";
import { createFileTypeSchema } from "../../../../types/storage";

export class AboutController {
  private aboutService: AboutService;

  constructor() {
    this.aboutService = new AboutService();
  }

  // --- ABOUT US SECTION CONTROLLERS ---
  getAboutByCampaignId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { campaignId } = req.params;
      const result = await this.aboutService.getAboutByCampaignId(
        campaignId.toString()
      );

      return sendSuccess(res, "Data About Us berhasil diambil", result, 200);
    } catch (error) {
      next(error);
    }
  };
  upsertAboutSection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { campaignId } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestUpsertAboutUsDTO = req.body;

      const file = req.file;
      if (file) {
        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }
      }

      const result = await this.aboutService.upsertAboutSection(
        agent,
        userData?.userId || "",
        campaignId.toString(),
        data,
        file
      );

      return sendSuccess(
        res,
        "About Us Section berhasil diperbarui/dibuat",
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };

  // --- CAMPAIGN TIM CONTROLLERS ---
  createCampaignTim = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestCreateCampaignTimDTO = req.body;

      const file = req.file;
      if (file) {
        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }
      }

      const result = await this.aboutService.createCampaignTim(
        agent,
        userData?.userId || "",
        data,
        file
      );

      return sendSuccess(res, "Anggota tim berhasil ditambahkan", result, 201);
    } catch (error) {
      next(error);
    }
  };
  updateCampaignTim = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestCreateCampaignTimDTO = req.body;

      const file = req.file;
      if (file) {
        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }
      }

      const result = await this.aboutService.updateCampaignTim(
        agent,
        userData?.userId || "",
        id.toString(),
        data,
        file
      );

      return sendSuccess(res, "Anggota tim berhasil diperbarui", result, 200);
    } catch (error) {
      next(error);
    }
  };
  deleteCampaignTim = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;

      const result = await this.aboutService.deleteCampaignTim(
        agent,
        userData?.userId || "",
        id.toString()
      );

      return sendSuccess(res, "Anggota tim berhasil dihapus", result, 200);
    } catch (error) {
      next(error);
    }
  };

  // --- WORK STRUCTURE DIVISION CONTROLLERS ---
  createWorkStructure = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agent = await userAgent(req);
      const userData = req.user;
      const data:RequestCreateWorkStructureDTO = req.body;

      const result = await this.aboutService.createWorkStructure(
        agent,
        userData?.userId || "",
        data
      );

      return sendSuccess(res, "Divisi struktur kerja berhasil ditambahkan", result, 201);
    } catch (error) {
      next(error);
    }
  };
  updateWorkStructure = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestCreateWorkStructureDTO = req.body;

      const result = await this.aboutService.updateWorkStructure(
        agent,
        userData?.userId || "",
        id.toString(),
        data
      );

      return sendSuccess(res, "Divisi struktur kerja berhasil diperbarui", result, 200);
    } catch (error) {
      next(error);
    }
  };
  deleteWorkStructure = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;

      const result = await this.aboutService.deleteWorkStructure(
        agent,
        userData?.userId || "",
        id.toString()
      );

      return sendSuccess(res, "Divisi struktur kerja berhasil dihapus", result, 200);
    } catch (error) {
      next(error);
    }
  };
}