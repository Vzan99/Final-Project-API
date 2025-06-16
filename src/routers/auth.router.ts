import { Router } from "express";
import {
  RegisterUserController,
  RegisterAdminController,
  LoginController,
  LogoutController,
} from "../controllers/auth.controller";
import {
  LoginSchema,
  RegisterAdminSchema,
  RegisterUserSchema,
} from "../schema/user.schema";
import ReqValidator from "../middlewares/reqValidator.middleware";

const router = Router();

router.post(
  "/register/user",
  ReqValidator(RegisterUserSchema),
  RegisterUserController
);

router.post(
  "/register/admin",
  ReqValidator(RegisterAdminSchema),
  RegisterAdminController
);

router.post("/login", ReqValidator(LoginSchema), LoginController);

router.post("/logout", LogoutController);

export default router;
