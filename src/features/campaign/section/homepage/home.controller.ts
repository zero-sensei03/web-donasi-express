import { NextFunction, Request, Response } from "express";
import { HomePageService } from "./home.service";
import { userAgent } from "../../../../utils/userAgent";
import { sendError, sendSuccess } from "../../../../utils/response";
import { RequestCreateSupportWorkDTO, RequestCreateWhySectionDTO, RequestUpsertHomePageDTO } from "./home.validate";
import { createFileTypeSchema } from "../../../../types/storage";

export class HomePageController {
  private homePageService: HomePageService;

  constructor() {
    this.homePageService = new HomePageService();
  }

  // --- HOME PAGE SECTION CONTROLLERS ---
  getHomePageByCampaignId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { campaignId } = req.params;
      const result = await this.homePageService.getHomePageByCampaignId(
        campaignId.toString()
      );

      return sendSuccess(res, "Data Home Page berhasil diambil", result, 200);
    } catch (error) {
      next(error);
    }
  };
  upsertHomePageSection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { campaignId } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestUpsertHomePageDTO = req.body;

      const files = req.files as {
            heroImage?: Express.Multer.File[];
            ctaImage?: Express.Multer.File[];
        };

        const heroImage = files.heroImage?.[0];
        const ctaImage = files.ctaImage?.[0];

        if (heroImage) {
            const imageSchema = createFileTypeSchema([
                "image/jpeg",
                "image/png",
                "image/webp",
            ]);

            const validation = imageSchema.safeParse({
                mimetype: heroImage.mimetype,
                buffer: heroImage.buffer,
            });

            if (!validation.success) {
                return sendError(
                    res,
                    "File hero image tidak valid",
                    undefined,
                    400,
                );
            }
        }


        if (ctaImage) {
            const imageSchema = createFileTypeSchema([
                "image/jpeg",
                "image/png",
                "image/webp",
            ]);

            const validationImage = imageSchema.safeParse({
                mimetype: ctaImage.mimetype,
                buffer: ctaImage.buffer,
            });

            if (!validationImage.success) {
                return sendError(
                    res,
                    "File cta image tidak valid",
                    undefined,
                    400,
                );
            }
        }

      const result = await this.homePageService.upsertHomePageSection(
        agent,
        userData?.userId || "",
        campaignId.toString(),
        data,
        heroImage,
        ctaImage
      );

      return sendSuccess(
        res,
        "Home Page Section berhasil diperbarui/dibuat",
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };

  // --- WHY SECTION CONTROLLERS ---
  createWhySection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestCreateWhySectionDTO = req.body;

      const file = req.file;
      if (file) {
        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }
      }

      const result = await this.homePageService.createWhySection(
        agent,
        userData?.userId || "",
        data,
        file
      );

      return sendSuccess(res, "Why Section berhasil ditambahkan", result, 201);
    } catch (error) {
      next(error);
    }
  };
  updateWhySection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestCreateWhySectionDTO = req.body;

      const file = req.file;
      if (file) {
        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }
      }

      const result = await this.homePageService.updateWhySection(
        agent,
        userData?.userId || "",
        id.toString(),
        data,
        file
      );

      return sendSuccess(res, "Why Section berhasil diperbarui", result, 200);
    } catch (error) {
      next(error);
    }
  };
  deleteWhySection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;

      const result = await this.homePageService.deleteWhySection(
        agent,
        userData?.userId || "",
        id.toString()
      );

      return sendSuccess(res, "Why Section berhasil dihapus", result, 200);
    } catch (error) {
      next(error);
    }
  };

  // --- SUPPORT WORK SECTION CONTROLLERS ---
  createSupportWork = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestCreateSupportWorkDTO = req.body;

      const file = req.file;
      if (file) {
        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }
      }

      const result = await this.homePageService.createSupportWork(
        agent,
        userData?.userId || "",
        data,
        file
      );

      return sendSuccess(
        res,
        "Support Work Section berhasil ditambahkan",
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  };
  updateSupportWork = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;
      const data: RequestCreateSupportWorkDTO = req.body;
      
      const file = req.file;
      if (file) {
        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const fileSchema = createFileTypeSchema(allowedMime);
        const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

        if (!validation.success) {
            return sendError(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
        }
      }

      const result = await this.homePageService.updateSupportWork(
        agent,
        userData?.userId || "",
        id.toString(),
        data,
        file
      );

      return sendSuccess(
        res,
        "Support Work Section berhasil diperbarui",
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };
  deleteSupportWork = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const agent = await userAgent(req);
      const userData = req.user;

      const result = await this.homePageService.deleteSupportWork(
        agent,
        userData?.userId || "",
        id.toString()
      );

      return sendSuccess(
        res,
        "Support Work Section berhasil dihapus",
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };
}