import { Router } from "express";
import { createUploadMiddleware } from "../../../middlewares/upload";
import { validate } from "../../../middlewares/validate";
import { CreateDonationSchema } from "./donation.validate";
import { DonationController, getDonationHome, StoreDonationController } from "./donation.controller";

const publicRouter = Router();

const uploadProof = createUploadMiddleware({
  maxFileSizeMB: 5,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
});
publicRouter.get("/campaign/:campaignId", getDonationHome)
publicRouter.post("/", uploadProof.single("proof"), validate(CreateDonationSchema), StoreDonationController)

const router = Router();
const donationController = new DonationController();

router.get("/campaign/:campaignId", donationController.getDonationByCampaignId);
router.get("/:id", donationController.getDonationById);
router.patch("/:id/status", donationController.patchDonation);

export { publicRouter as donatePublicRouter, router as donateRouter };