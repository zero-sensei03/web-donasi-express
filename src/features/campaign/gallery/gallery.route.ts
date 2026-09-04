import { Router } from "express";
import { createUploadMiddleware } from "../../../middlewares/upload";
import { validate } from "../../../middlewares/validate";
import { GalleryController, GalleryPublicController } from "./gallery.controller";
import { CreateGallerySchema } from "./gallery.validate";

const publicRouter = Router();

publicRouter.get("/", GalleryPublicController)

const router = Router();
const galleryController = new GalleryController();

const uploadGallery = createUploadMiddleware({
  maxFileSizeMB: 50,
  maxFilesCount: 2,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
});

router.get("/campaign/:campaignId", galleryController.getGalleryByCampaignId);
router.get("/:id", galleryController.getGalleryById);
router.post(
  "/",
  uploadGallery.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  validate(CreateGallerySchema),
  galleryController.createGallery,
);
router.put(
  "/:id",
  uploadGallery.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  validate(CreateGallerySchema),
  galleryController.updateGallery,
);
router.delete("/:id", galleryController.deleteGallery);

export { publicRouter as galleryPublicRouter, router as galleryRouter };