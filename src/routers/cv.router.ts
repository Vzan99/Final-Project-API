import { Router } from "express";
import {
  VerifyToken,
  UserGuard,
  SubscriberGuard,
} from "../middlewares/auth.middleware";
import { getCVFormData, generateCV } from "../controllers/cv.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Hanya untuk user dengan subscription aktif
router.use(VerifyToken, UserGuard, asyncHandler(SubscriberGuard));

router.get("/cv-form", asyncHandler(getCVFormData));
router.post("/generate-cv", asyncHandler(generateCV));

export default router;
