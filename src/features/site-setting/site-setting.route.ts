import { Router } from "express";
import { SiteSetting, SiteSettingPublicController } from "./site-setting.controller";
import { createUploadMiddleware } from "../../middlewares/upload";
import { authorizeRoles } from "../../middlewares/auth";

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
protectedRouter.patch("/", authorizeRoles("SUPERADMIN", "ADMIN"), siteSettingController.updateValue)
protectedRouter.patch("/logo", authorizeRoles("SUPERADMIN", "ADMIN"), uploadLogo.single('logo'), siteSettingController.updateLogo)

export { publicRouter as siteSettingPublicRouter, protectedRouter as siteSettingProtectedRouter }