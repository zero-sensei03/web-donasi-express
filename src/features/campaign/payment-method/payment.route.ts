import { Router } from "express";
import { createUploadMiddleware } from "../../../middlewares/upload";
import { validate } from "../../../middlewares/validate";
import { PaymentController, PublicController } from "./payment.controller";
import { CreatePaymentMethodSchema } from "./payment.validate";

const publicRouter = Router();

publicRouter.get("/campaign/:campaignId", PublicController)

const router = Router();
const protectedController = new PaymentController();

const upload = createUploadMiddleware({
  maxFileSizeMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

router.get("/campaign/:campaignId", protectedController.getByCampaignId);
router.get("/:id", protectedController.getById);
router.post("/", upload.single("qris"), validate(CreatePaymentMethodSchema), protectedController.create);
router.put("/:id", upload.single("qris"), validate(CreatePaymentMethodSchema), protectedController.update);
router.delete("/:id", protectedController.delete);

export { publicRouter as PaymentRouter, router as protectedPaymentRouter };