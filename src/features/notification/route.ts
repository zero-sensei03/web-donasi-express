import { Router } from "express";
import { NotificationController } from "./controller";

const router = Router();
const notifController = new NotificationController();

router.get("/", notifController.getAll)
router.patch("/read/:id", notifController.read)
router.patch("/read", notifController.readAll)

export { router as notifRouter }