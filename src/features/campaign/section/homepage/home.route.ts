import { Router } from "express";
import { createUploadMiddleware } from "../../../../middlewares/upload";
import { HomePageController } from "./home.controller";
import { validate } from "../../../../middlewares/validate";
import { CreateSupportWorkSchema, CreateWhySectionSchema, UpsertHomePageSchema } from "./home.validate";

const router = Router();
const dataController = new HomePageController();

const uploadFile = createUploadMiddleware({
  maxFileSizeMB: 2,
  maxFilesCount: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});
const uploadSingle = createUploadMiddleware({
  maxFileSizeMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

router.get("/campaign/:campaignId", dataController.getHomePageByCampaignId);
router.post(
    "/campaign/:campaignId",
    uploadFile.fields([
        { name: "heroImage", maxCount: 1 },
        { name: "ctaImage", maxCount: 1 },
    ]),
    validate(UpsertHomePageSchema),
    dataController.upsertHomePageSection
);

router.post("/why-section", uploadSingle.single("image"), validate(CreateWhySectionSchema), dataController.createWhySection);
router.put("/why-section/:id", uploadSingle.single("image"), validate(CreateWhySectionSchema), dataController.updateWhySection);
router.delete("/why-section", dataController.deleteWhySection);

router.post("/suppoprt-work", uploadSingle.single("image"), validate(CreateSupportWorkSchema), dataController.createSupportWork);
router.put("/suppoprt-work/:id", uploadSingle.single("image"), validate(CreateSupportWorkSchema), dataController.updateSupportWork);
router.delete("/suppoprt-work", dataController.deleteSupportWork);

export { router as homeRouter };