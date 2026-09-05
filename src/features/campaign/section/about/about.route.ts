import { Router } from "express";
import { createUploadMiddleware } from "../../../../middlewares/upload";
import { AboutController } from "./about.controller";
import { validate } from "../../../../middlewares/validate";
import { CreateCampaignTimSchema, CreateWorkStructureSchema, UpsertAboutUsSchema } from "./about.validate";

const router = Router();
const dataController = new AboutController();

const uploadFile = createUploadMiddleware({
  maxFileSizeMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

router.get("/campaign/:campaignId", dataController.getAboutByCampaignId);
router.post("/campaign/:campaignId", uploadFile.single("image"), validate(UpsertAboutUsSchema), dataController.upsertAboutSection);

router.post("/campaign-tim", uploadFile.single("image"), validate(CreateCampaignTimSchema), dataController.createCampaignTim);
router.put("/campaign-tim/:id", uploadFile.single("image"), validate(CreateCampaignTimSchema), dataController.updateCampaignTim);
router.delete("/campaign-tim", dataController.deleteCampaignTim);

router.post("/campaign-work-structure", validate(CreateWorkStructureSchema), dataController.createWorkStructure);
router.put("/campaign-work-structure/:id", validate(CreateWorkStructureSchema), dataController.updateWorkStructure);
router.delete("/campaign-work-structure", dataController.deleteWorkStructure);

export { router as aboutRouter };