import express from "express";
import {
  createAssessmentHandler,
  getAssessmentsHandler,
  submitAssessmentHandler,
  getAssessmentResultHandler,
  getAssessmentDetailHandler,
  getDeveloperAssessmentsHandler,
} from "../controllers/assessment.controller";

import {
  VerifyToken,
  DeveloperGuard,
  SubscriberGuard,
} from "../middlewares/auth.middleware";

const router = express.Router();

// ─────────────────────────────────────────────────────────
// USER with subscription

router.get("/", VerifyToken, SubscriberGuard, getAssessmentsHandler);
router.post(
  "/:id/submit",
  VerifyToken,
  SubscriberGuard,
  submitAssessmentHandler
);
router.get(
  "/:id/result",
  VerifyToken,
  SubscriberGuard,
  getAssessmentResultHandler
);
router.get(
  "/:id/detail",
  VerifyToken,
  SubscriberGuard,
  getAssessmentDetailHandler
);

// ─────────────────────────────────────────────────────────
// DEVELOPER only

router.post("/", VerifyToken, DeveloperGuard, createAssessmentHandler);
router.get(
  "/developer/all",
  VerifyToken,
  DeveloperGuard,
  getDeveloperAssessmentsHandler
);

export default router;
