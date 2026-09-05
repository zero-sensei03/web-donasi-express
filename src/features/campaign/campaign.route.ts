import { Router } from "express";
import { createUploadMiddleware } from "../../middlewares/upload";
import { CampaignController, CampaignDonationPublicController, CampaignPublicController } from "./campaign.controller";
import { validate } from "../../middlewares/validate";
import { CreateCampaignSchema } from "./campaign.validate";

const publicRouter = Router();

publicRouter.get("/", CampaignPublicController);
publicRouter.get("/donation/:campaignId", CampaignDonationPublicController);

const protectedRouter = Router();
const campaignController = new CampaignController();

protectedRouter.get("/", campaignController.getAllCampaign);
protectedRouter.get("/:id", campaignController.getCampaignById);
protectedRouter.post("/", validate(CreateCampaignSchema), campaignController.createCampaign);
protectedRouter.put("/:id", validate(CreateCampaignSchema), campaignController.updateCampaign);
protectedRouter.delete("/:id", campaignController.softDeleteCampaign);

protectedRouter.patch("/:id/restore", campaignController.restoreCampaign);
protectedRouter.delete("/:id/hard", campaignController.hardDeleteCampaign);

protectedRouter.patch("/:id/set-active", campaignController.setActiveCampaign);

export { publicRouter as campaignPublicRouter, protectedRouter as campaignProtectedRouter }