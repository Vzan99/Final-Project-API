import express from "express";
import {
  createAssessmentHandler,
  getAssessmentsHandler,
  submitAssessmentHandler,
  getAssessmentResultHandler,
  getAssessmentDetailHandler,
  getDeveloperAssessmentsHandler,
  updateAssessmentHandler,
  deleteAssessmentHandler,
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
router.put("/:id", VerifyToken, DeveloperGuard, updateAssessmentHandler);
router.delete("/:id", VerifyToken, DeveloperGuard, deleteAssessmentHandler);

export default router;
