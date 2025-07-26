import { Router } from "express";
import {
  RegisterUserController,
  RegisterAdminController,
  LoginController,
  LogoutController,
  VerifyEmailController,
  ResendVerificationController,
  SyncGoogleUserController,
  RequestPasswordResetController,
  ResetPasswordController,
  VerifyNewEmailController,
} from "../controllers/auth.controller";
import {
  LoginSchema,
  RegisterAdminSchema,
  RegisterUserSchema,
  VerifyEmailSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from "../schema/auth.schema";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";
import { VerifyToken } from "../middlewares/auth.middleware";

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

router.post("/resend-verification", VerifyToken, ResendVerificationController);

router.post("/sync-google", SyncGoogleUserController);

router.post(
  "/request-password-reset",
  ReqValidator(RequestPasswordResetSchema),
  RequestPasswordResetController
);

router.post(
  "/reset-password",
  ReqValidator(ResetPasswordSchema),
  ResetPasswordController
);

router.get(
  "/verify-new-email",
  QueryValidator(VerifyEmailSchema),
  VerifyNewEmailController
);

export default router;
