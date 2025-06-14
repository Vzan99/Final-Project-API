import { Router } from "express";
import {
  RegisterUserController,
  RegisterAdminController,
  LoginController,
} from "../controllers/auth.controller";
import {
  LoginSchema,
  RegisterAdminSchema,
  RegisterUserSchema,
} from "../schema/user.schema";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { GoogleLoginController } from "../controllers/auth.controller";

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

router.post("/login/google", GoogleLoginController);

export default router;
