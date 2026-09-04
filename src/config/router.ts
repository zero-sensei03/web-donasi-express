import { Router } from "express";
import { siteSettingProtectedRouter, siteSettingPublicRouter } from "../features/site-setting/site-setting.route";
import { authenticate } from "../middlewares/auth";
import { AuthRouter } from "../features/auth/auth.router";
import { campaignProtectedRouter, campaignPublicRouter } from "../features/campaign/campaign.route";

const router = Router()


router.use("/auth", AuthRouter)

router.use("/public/site-setting", siteSettingPublicRouter)
router.use("/public/campaign", campaignPublicRouter)

router.use("/protected/site-setting", authenticate, siteSettingProtectedRouter)
router.use("/protected/campaign", authenticate, campaignProtectedRouter)

export { router }