import { prisma } from "../../../../lib/prisma";
import { AppError } from "../../../../utils/AppError";
import { AuditService } from "../../../audit/service";
import { agentResult } from "../../../../utils/userAgent";
import {
  RequestUpsertAboutUsDTO,
  RequestCreateCampaignTimDTO,
  RequestCreateWorkStructureDTO,
} from "./about.validate";
import { Prisma } from "../../../../generated/prisma/client";
import { storageService } from "../../../../lib/storage.service";

export class AboutService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  async getAboutByCampaignId(campaignId: string) {
    try {
      if (!campaignId) {
        throw new AppError("Campaign ID tidak boleh kosong", 400);
      }

      const about = await prisma.aboutUsSection.findUnique({
        where: { campaignId },
        include: {
          CampaignTim: true,
          WorkStructureDivision: true,
        },
      });

      return about;
    } catch (error) {
      throw error;
    }
  }
  async upsertAboutSection(
    agent: agentResult,
    userId: string,
    campaignId: string,
    data: RequestUpsertAboutUsDTO,
    file?: Express.Multer.File | null
  ) {
    try {

      const existingAbout = await prisma.aboutUsSection.findUnique({
        where: { campaignId },
        select: { heroBgImage: true },
      });

      const payload: RequestUpsertAboutUsDTO & { heroBgImage?: string | null, campaignId: string } = {
        ...data,
        campaignId,
        heroBgImage: existingAbout?.heroBgImage || null
      }
      if(file) {
        const dataFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'others',
        });

        payload.heroBgImage = dataFile
      }
      return await prisma.$transaction(async (tx) => {
        const result = await tx.aboutUsSection.upsert({
          where: { campaignId },
          update: payload,
          create: payload,
        });

        await this.auditService.create(
          tx,
          userId,
          existingAbout ? "UPDATE" : "CREATE",
          "about_us_section",
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

  // --- CAMPAIGN TIM CRUD ---
  async createCampaignTim(
    agent: agentResult,
    userId: string,
    data: RequestCreateCampaignTimDTO,
    file?: Express.Multer.File | null
  ) {
    try {
      const aboutExist = await prisma.aboutUsSection.findUnique({
        where: { id: data.aboutUsSectionId },
      });

      if (!aboutExist) {
        throw new AppError("About Us Section tidak ditemukan", 404);
      }

      const payload: RequestCreateCampaignTimDTO & { image: string | null } = {
        ...data,
        image: null
      }

      if(file) {
        const dataFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'others',
        });

        payload.image = dataFile
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.campaignTim.create({
          data: payload,
        });

        await this.auditService.create(
          tx,
          userId,
          "CREATE",
          "campaign_tim",
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
  async updateCampaignTim(
    agent: agentResult,
    userId: string,
    id: string,
    data: RequestCreateCampaignTimDTO,
    file?: Express.Multer.File | null
  ) {
    try {
      const timExist = await prisma.campaignTim.findUnique({ where: { id } });
      if (!timExist) {
        throw new AppError("Data tim tidak ditemukan", 404);
      }

      const payload: RequestCreateCampaignTimDTO & { image: string | null } = {
        ...data,
        image: timExist.image
      }

      if(file) {
        const dataFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'others',
        });

        payload.image = dataFile
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.campaignTim.update({
          where: { id },
          data: payload,
        });

        await this.auditService.create(
          tx,
          userId,
          "UPDATE",
          "campaign_tim",
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
  async deleteCampaignTim(agent: agentResult, userId: string, id: string) {
    try {
      const timExist = await prisma.campaignTim.findUnique({ where: { id } });
      if (!timExist) {
        throw new AppError("Data tim tidak ditemukan", 404);
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.campaignTim.delete({
          where: { id },
        });

        await this.auditService.create(
          tx,
          userId,
          "DELETE",
          "campaign_tim",
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

  // --- WORK STRUCTURE DIVISION CRUD ---
  async createWorkStructure(
    agent: agentResult,
    userId: string,
    data: RequestCreateWorkStructureDTO
  ) {
    try {
      const aboutExist = await prisma.aboutUsSection.findUnique({
        where: { id: data.aboutUsSectionId },
      });

      if (!aboutExist) {
        throw new AppError("About Us Section tidak ditemukan", 404);
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.workStructureDivision.create({
          data,
        });

        await this.auditService.create(
          tx,
          userId,
          "CREATE",
          "work_structure_division",
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
  async updateWorkStructure(
    agent: agentResult,
    userId: string,
    id: string,
    data: RequestCreateWorkStructureDTO
  ) {
    try {
      const structureExist = await prisma.workStructureDivision.findUnique({
        where: { id },
      });
      if (!structureExist) {
        throw new AppError("Struktur kerja tidak ditemukan", 404);
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.workStructureDivision.update({
          where: { id },
          data,
        });

        await this.auditService.create(
          tx,
          userId,
          "UPDATE",
          "work_structure_division",
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
  async deleteWorkStructure(agent: agentResult, userId: string, id: string) {
    try {
      const structureExist = await prisma.workStructureDivision.findUnique({
        where: { id },
      });
      if (!structureExist) {
        throw new AppError("Struktur kerja tidak ditemukan", 404);
      }

      return await prisma.$transaction(async (tx) => {
        const result = await tx.workStructureDivision.delete({
          where: { id },
        });

        await this.auditService.create(
          tx,
          userId,
          "DELETE",
          "work_structure_division",
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