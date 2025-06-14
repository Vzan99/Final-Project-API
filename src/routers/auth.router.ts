import { Router } from "express";
import {
  RegisterUserController,
  RegisterAdminCompanyController,
  LoginController,
} from "../controllers/auth.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import {
  LoginSchema,
  RegisterAdminCompanySchema,
  RegisterUserSchema,
} from "../schema/user.schema";

const router = Router();

router.post(
  "/register/user",
  ReqValidator(RegisterUserSchema),
  RegisterUserController
);

router.post(
  "/register/admin",
  ReqValidator(RegisterAdminCompanySchema),
  RegisterAdminCompanyController
);

router.post("/login", ReqValidator(LoginSchema), LoginController);

export default router;
