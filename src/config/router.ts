import { Router } from "express";
import { siteSettingProtectedRouter, siteSettingPublicRouter } from "../features/site-setting/site-setting.route";
import { authenticate } from "../middlewares/auth";
import { AuthRouter } from "../features/auth/auth.router";
import { campaignProtectedRouter, campaignPublicRouter } from "../features/campaign/campaign.route";
import { proposalPublicRouter, proposalRouter } from "../features/campaign/proposal/prpoposal.route";
import { galleryPublicRouter, galleryRouter } from "../features/campaign/gallery/gallery.route";
import { donatePublicRouter, donateRouter } from "../features/campaign/donation/donation.route";

const router = Router()


router.use("/auth", AuthRouter)

router.use("/public/site-setting", siteSettingPublicRouter)
router.use("/public/campaign", campaignPublicRouter)
router.use("/public/proposal", proposalPublicRouter)
router.use("/public/gallery", galleryPublicRouter)
router.use("/public/donation", donatePublicRouter)

router.use("/protected/site-setting", authenticate, siteSettingProtectedRouter)
router.use("/protected/campaign", authenticate, campaignProtectedRouter)
router.use("/protected/proposal", authenticate, proposalRouter)
router.use("/protected/gallery", authenticate, galleryRouter)
router.use("/protected/donation", authenticate, donateRouter)

export { router }