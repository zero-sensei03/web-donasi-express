import { Router } from "express";
import { createUploadMiddleware } from "../../../middlewares/upload";
import { validate } from "../../../middlewares/validate";
import { DataController, PublicController } from "./contact.controller";
import { CreateContactSchema } from "./contact.validate";

const publicRouter = Router();

publicRouter.get("/campaign/:campaignId", PublicController)

const router = Router();
const protectedController = new DataController();

router.get("/campaign/:campaignId", protectedController.getByCampaignId);
router.get("/:id", protectedController.getById);
router.post("/", validate(CreateContactSchema), protectedController.create);
router.put("/:id", validate(CreateContactSchema), protectedController.update);
router.delete("/:id", protectedController.delete);

export { publicRouter as ContactRouter, router as protectedContactRouter };