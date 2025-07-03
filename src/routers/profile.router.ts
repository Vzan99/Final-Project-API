import { Router } from "express";
import {
  GetProfileController,
  ChangePasswordController,
  ChangeEmailController,
  UpdateProfileController,
} from "../controllers/profile.controller";
import { VerifyToken } from "../middlewares/auth.middleware";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { updateProfileSchema } from "../schema/profile.schema";

const router = Router();

router.get("/", VerifyToken, GetProfileController);

router.put("/change-password", VerifyToken, ChangePasswordController);

router.put("/change-email", VerifyToken, ChangeEmailController);

router.put(
  "/",
  VerifyToken,
  ReqValidator(updateProfileSchema),
  UpdateProfileController
);

export default router;
