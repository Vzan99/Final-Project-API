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
  UpdateCompanyProfileController,
} from "../controllers/profile.controller";
import {
  AdminGuard,
  UserGuard,
  VerifyToken,
} from "../middlewares/auth.middleware";
import ReqValidator from "../middlewares/reqValidator.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  updateExperiencesSchema,
  updateCompanyProfileSchema,
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
  UserGuard,
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
  UserGuard,
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
  UserGuard,
  ReqValidator(updateExperiencesSchema),
  UpdateExperiencesController
);

router.put(
  "/edit/company",
  VerifyToken,
  AdminGuard,
  ReqValidator(updateCompanyProfileSchema),
  UpdateCompanyProfileController
);

export default router;
