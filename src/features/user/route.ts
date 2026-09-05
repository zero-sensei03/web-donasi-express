import { Router } from "express";
import { UserController } from "./controller";
import { authorizeRoles } from "../../middlewares/auth";
import { CreateUserSchema, UpdateUserSchema } from "./validate";
import { validate } from "../../middlewares/validate";

const router = Router();
const userController = new UserController();

router.get("/", authorizeRoles("SUPERADMIN", "ADMIN"), userController.getAll)
router.get("/:id", authorizeRoles("SUPERADMIN", "ADMIN"), userController.getById)
router.post("/", authorizeRoles("SUPERADMIN", "ADMIN"), validate(CreateUserSchema), userController.create)
router.put("/:id", authorizeRoles("SUPERADMIN", "ADMIN"), validate(UpdateUserSchema), userController.update)
router.delete("/:id", authorizeRoles("SUPERADMIN", "ADMIN"), userController.delete)

export { router as userRouter }