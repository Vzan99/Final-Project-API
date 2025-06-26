import express from "express";
import {
  createAssessmentHandler,
  getAssessmentsHandler,
  submitAssessmentHandler,
  getAssessmentResultHandler,
} from "../controllers/assessment.controller";
import {
  VerifyToken,
  DeveloperGuard,
  SubscriberGuard,
} from "../middlewares/auth.middleware";

const router = express.Router();

// GET all active assessments (for subscribed users)
router.get("/", VerifyToken, SubscriberGuard, getAssessmentsHandler);

// Submit answers to an assessment
router.post(
  "/:id/submit",
  VerifyToken,
  SubscriberGuard,
  submitAssessmentHandler
);

// Get result for a submitted assessment
router.get(
  "/:id/result",
  VerifyToken,
  SubscriberGuard,
  getAssessmentResultHandler
);

// Developer only: Create a new assessment
router.post("/", VerifyToken, DeveloperGuard, createAssessmentHandler);

export default router;
