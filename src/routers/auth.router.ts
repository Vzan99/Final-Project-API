import { Router } from "express";
import {
  RegisterUserController,
  RegisterAdminController,
  LoginController,
  LogoutController,
  VerifyEmailController,
} from "../controllers/auth.controller";
import {
  LoginSchema,
  RegisterAdminSchema,
  RegisterUserSchema,
  VerifyEmailSchema,
} from "../schema/user.schema";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";

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

router.get(
  "/verify-email",
  QueryValidator(VerifyEmailSchema),
  VerifyEmailController
);

export default router;
