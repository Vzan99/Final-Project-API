import { Router } from "express";
import { VerifyToken as authMiddleware } from "../middlewares/auth.middleware";
import { checkActiveSubscription } from "../middlewares/checkSubscription.middleware";
import { getCVFormData, generateCV } from "../controllers/cv.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);
router.use(asyncHandler(checkActiveSubscription));

router.get("/cv-form", asyncHandler(getCVFormData));
router.post("/generate-cv", asyncHandler(generateCV));

export default router;
