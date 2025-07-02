import { Router } from "express";
import {
  GetProfileController,
  ChangePasswordController,
  ChangeEmailController,
} from "../controllers/profile.controller";
import { VerifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", VerifyToken, GetProfileController);

router.put("/change-password", VerifyToken, ChangePasswordController);

router.put("/change-email", VerifyToken, ChangeEmailController);

export default router;
