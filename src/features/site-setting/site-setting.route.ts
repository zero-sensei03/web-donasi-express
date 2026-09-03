import { Router } from "express";
import { SiteSetting, SiteSettingPublicController } from "./site-setting.controller";
import { createUploadMiddleware } from "../../middlewares/upload";

const publicRouter = Router();

publicRouter.get("/", SiteSettingPublicController);


const protectedRouter = Router();

const siteSettingController = new SiteSetting();
const uploadLogo = createUploadMiddleware({
  maxFileSizeMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});
protectedRouter.get("/", siteSettingController.get)
protectedRouter.get("/:key", siteSettingController.getByKey)
protectedRouter.patch("/", siteSettingController.updateValue)
protectedRouter.patch("/logo", uploadLogo.single('logo'), siteSettingController.updateLogo)

export { publicRouter as siteSettingPublicRouter, protectedRouter as siteSettingProtectedRouter }