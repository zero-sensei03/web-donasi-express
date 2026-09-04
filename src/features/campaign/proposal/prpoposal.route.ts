import { Router } from "express";
import { ProposalController, ProposalPublicController } from "./proposal.controller";
import { createUploadMiddleware } from "../../../middlewares/upload";
import { validate } from "../../../middlewares/validate";
import { CreateCampaignProposalSchema } from "./proposal.validate";

const publicRouter = Router();

publicRouter.get("/", ProposalPublicController)

const router = Router();
const proposalControlle = new ProposalController();

const uploadProposal = createUploadMiddleware({
  maxFileSizeMB: 5,
  allowedMimeTypes: ['application/pdf'],
});

router.get("/campaign/:campaignId", proposalControlle.getProposalByCampaignId);
router.get("/:id", proposalControlle.getProposalById);
router.post("/", uploadProposal.single("proposal"), validate(CreateCampaignProposalSchema), proposalControlle.createProposal);
router.put("/:id", uploadProposal.single("proposal"), validate(CreateCampaignProposalSchema), proposalControlle.updateProposal);
router.delete("/:id", proposalControlle.deleteProposal);

export { publicRouter as proposalPublicRouter, router as proposalRouter };