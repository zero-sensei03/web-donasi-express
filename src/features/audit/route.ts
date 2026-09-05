import { Router } from "express";
import { AuditController } from "./controller";
import { authorizeRoles } from "../../middlewares/auth";

const router = Router();
const auditController = new AuditController();

router.get("/", authorizeRoles("SUPERADMIN", "ADMIN"), auditController.getAll)
router.get("/:id", authorizeRoles("SUPERADMIN", "ADMIN"), auditController.getByid)

export { router as auditRouter }