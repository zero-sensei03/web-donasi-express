import { Router } from "express";
import { LoginSchema } from "./auth.validate";
import { validate } from "../../middlewares/validate";
import { AuthController } from "./auth.controller";

const router = Router()
const authController = new AuthController();

router.post("/sign-in", validate(LoginSchema), authController.login);
router.post("/refresh", authController.refresh);

export { router as AuthRouter }