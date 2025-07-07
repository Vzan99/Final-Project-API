import { Router } from "express";
import {
  GetProfileController,
  ChangePasswordController,
  ChangeEmailController,
  UpdateProfileController,
  UpdateProfilePhotoController,
  UpdateResumeController,
  UpdateBannerController,
  UpdateExperiencesController,
} from "../controllers/profile.controller";
import { VerifyToken } from "../middlewares/auth.middleware";
import ReqValidator from "../middlewares/reqValidator.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  updateExperiencesSchema,
} from "../schema/profile.schema";
import { Multer } from "../utils/multer";

const router = Router();

router.get("/", VerifyToken, GetProfileController);

router.put(
  "/change-password",
  VerifyToken,
  ReqValidator(changePasswordSchema),
  ChangePasswordController
);

router.put(
  "/change-email",
  VerifyToken,
  ReqValidator(changeEmailSchema),
  ChangeEmailController
);

router.put(
  "/edit/user",
  VerifyToken,
  ReqValidator(updateProfileSchema),
  UpdateProfileController
);

router.put(
  "/edit/photo",
  VerifyToken,
  Multer().single("photo"),
  UpdateProfilePhotoController
);

router.put(
  "/edit/resume",
  VerifyToken,
  Multer().single("resume"),
  UpdateResumeController
);

router.put(
  "/edit/banner",
  VerifyToken,
  Multer().single("banner"),
  UpdateBannerController
);

router.put(
  "/edit/experiences",
  VerifyToken,
  ReqValidator(updateExperiencesSchema),
  UpdateExperiencesController
);

export default router;
