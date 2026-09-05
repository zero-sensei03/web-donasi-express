import { prisma } from "../../../../lib/prisma";
import { AppError } from "../../../../utils/AppError";
import { AuditService } from "../../../audit/service";
import { agentResult } from "../../../../utils/userAgent";
import {
  RequestUpsertHomePageDTO,
  RequestCreateWhySectionDTO,
  RequestCreateSupportWorkDTO,
} from "./home.validate";
import { storageService } from "../../../../lib/storage.service";

export class HomePageService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  // --- HOME PAGE SECTION (Get & Upsert) ---
  async getHomePageByCampaignId(campaignId: string) {
    try {
      if (!campaignId) {
        throw new AppError("Campaign ID tidak boleh kosong", 400);
      }

      const pageSection = await prisma.homePageSection.findUnique({
        where: { campaignId },
        include: {
          whySection: true,
          supportWorkSection: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return pageSection;
    } catch (error) {
      throw error;
    }
  }
  async upsertHomePageSection(
    agent: agentResult,
    userId: string,
    campaignId: string,
    data: RequestUpsertHomePageDTO,
    fileBgHero?: Express.Multer.File | null,
    fileBgCTA?: Express.Multer.File | null,
  ) {

    const existingAbout = await prisma.homePageSection.findUnique({
        where: { campaignId },
        select: { heroBgImage: true, ctaSectionBgImage: true },
    });

    const payload: RequestUpsertHomePageDTO & { heroBgImage?: string | null, ctaSectionBgImage?: string | null, campaignId: string } = {
        ...data,
        campaignId,
        heroBgImage: existingAbout?.heroBgImage || null,
        ctaSectionBgImage: existingAbout?.ctaSectionBgImage || null
    }
    if(fileBgHero) {
        const dataFile = await storageService.upload(fileBgHero.buffer, fileBgHero.mimetype, {
            folder: 'others',
        });

        payload.heroBgImage = dataFile
    }
    if(fileBgCTA) {
        const dataFile = await storageService.upload(fileBgCTA.buffer, fileBgCTA.mimetype, {
            folder: 'others',
        });

        payload.ctaSectionBgImage = dataFile
    }
    try {
      return await prisma.$transaction(async (tx) => {
        const result = await tx.homePageSection.upsert({
          where: { campaignId },
          update: { ...data },
          create: {
            campaignId,
            ...data,
          },
        });

        await this.auditService.create(
          tx,
          userId,
          existingAbout ? "UPDATE" : "CREATE",
          "home_page_section",
          result.id,
          agent,
          result
        );

        return result;
      });
    } catch (error) {
      throw error;
    }
  }

  // --- WHY SECTION CRUD ---
  async createWhySection(
    agent: agentResult,
    userId: string,
    data: RequestCreateWhySectionDTO,
    file?: Express.Multer.File | null,
  ) {
    try {
      const sectionExist = await prisma.homePageSection.findUnique({
        where: { id: data.homePageSectionId },
      });

      if (!sectionExist) {
        throw new AppError("HomePage Section tidak ditemukan", 404);
      }

    const payload: RequestCreateWhySectionDTO & { icon?: string | null } = {
        ...data,
        icon: null
    }
    if(file) {
        const dataFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'others',
        });

        payload.icon = dataFile
    }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.whySection.create({
          data: payload,
        });

        await this.auditService.create(
          tx,
          userId,
          "CREATE",
          "why_section",
          result.id,
          agent,
          result
        );

        return result;
      });
    } catch (error) {
      throw error;
    }
  }
  async updateWhySection(
    agent: agentResult,
    userId: string,
    id: string,
    data: RequestCreateWhySectionDTO,
    file?: Express.Multer.File | null
  ) {
    try {
      const whyExist = await prisma.whySection.findUnique({ where: { id } });
      if (!whyExist) {
        throw new AppError("Why Section tidak ditemukan", 404);
      }

    const payload: RequestCreateWhySectionDTO & { icon?: string | null } = {
        ...data,
        icon: whyExist.icon
    }
    if(file) {
        const dataFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'others',
        });
        payload.icon = dataFile
    }

        

      return await prisma.$transaction(async (tx) => {
        const result = await tx.whySection.update({
          where: { id },
          data: payload,
        });

        await this.auditService.create(
          tx,
          userId,
          "UPDATE",
          "why_section",
          result.id,
          agent,
          result
        );

        return result;
      });
    } catch (error) {
      throw error;
    }
  }
  async deleteWhySection(agent: agentResult, userId: string, id: string) {
    try {
      const whyExist = await prisma.whySection.findUnique({ where: { id } });
      if (!whyExist) {
        throw new AppError("Why Section tidak ditemukan", 404);
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.whySection.delete({
          where: { id },
        });

        await this.auditService.create(
          tx,
          userId,
          "DELETE",
          "why_section",
          result.id,
          agent,
          result
        );

        return result;
      });
    } catch (error) {
      throw error;
    }
  }

  // --- SUPPORT WORK SECTION CRUD ---
  async createSupportWork(
    agent: agentResult,
    userId: string,
    data: RequestCreateSupportWorkDTO,
    file?: Express.Multer.File | null
  ) {
    try {
      const sectionExist = await prisma.homePageSection.findUnique({
        where: { id: data.homePageSectionId },
      });

      if (!sectionExist) {
        throw new AppError("HomePage Section tidak ditemukan", 404);
      }

      const orderExist = await prisma.supportWorkSection.findUnique({
        where: {
          homePageSectionId_order: {
            homePageSectionId: data.homePageSectionId,
            order: data.order,
          },
        },
      });

      if (orderExist) {
        throw new AppError("Urutan (order) untuk Support Work sudah digunakan", 400);
      }

    const payload: RequestCreateSupportWorkDTO & { icon?: string | null } = {
        ...data,
        icon: null
    }
    if(file) {
        const dataFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'others',
        });
        payload.icon = dataFile
    }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.supportWorkSection.create({
          data: payload,
        });

        await this.auditService.create(
          tx,
          userId,
          "CREATE",
          "support_work_section",
          result.id,
          agent,
          result
        );

        return result;
      });
    } catch (error) {
      throw error;
    }
  }
  async updateSupportWork(
    agent: agentResult,
    userId: string,
    id: string,
    data: RequestCreateSupportWorkDTO,
    file?: Express.Multer.File | null
  ) {
    try {
      const supportExist = await prisma.supportWorkSection.findUnique({
        where: { id },
      });
      if (!supportExist) {
        throw new AppError("Support Work Section tidak ditemukan", 404);
      }

      if (data.order && data.order !== supportExist.order) {
        const orderExist = await prisma.supportWorkSection.findUnique({
          where: {
            homePageSectionId_order: {
              homePageSectionId: supportExist.homePageSectionId,
              order: data.order,
            },
          },
        });

        if (orderExist) {
          throw new AppError("Urutan (order) untuk Support Work sudah digunakan", 400);
        }
      }

    const payload: RequestCreateSupportWorkDTO & { icon?: string | null } = {
        ...data,
        icon: supportExist.icon
    }
    if(file) {
        const dataFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'others',
        });
        payload.icon = dataFile
    }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.supportWorkSection.update({
          where: { id },
          data: payload,
        });

        await this.auditService.create(
          tx,
          userId,
          "UPDATE",
          "support_work_section",
          result.id,
          agent,
          result
        );

        return result;
      });
    } catch (error) {
      throw error;
    }
  }
  async deleteSupportWork(agent: agentResult, userId: string, id: string) {
    try {
      const supportExist = await prisma.supportWorkSection.findUnique({
        where: { id },
      });
      if (!supportExist) {
        throw new AppError("Support Work Section tidak ditemukan", 404);
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.supportWorkSection.delete({
          where: { id },
        });

        await this.auditService.create(
          tx,
          userId,
          "DELETE",
          "support_work_section",
          result.id,
          agent,
          result
        );

        return result;
      });
    } catch (error) {
      throw error;
    }
  }
}