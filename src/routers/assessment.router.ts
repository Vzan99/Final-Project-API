import express from "express";
import {
  createAssessmentHandler,
  getAssessmentsHandler,
  submitAssessmentHandler,
  getAssessmentDetailHandler,
  getDeveloperAssessmentsHandler,
  updateAssessmentHandler,
  deleteAssessmentHandler,
  getUserAssessmentResultsHandler,
  getAssessmentResultByIdHandler,
} from "../controllers/assessment.controller";

import {
  VerifyToken,
  DeveloperGuard,
  SubscriberGuard,
} from "../middlewares/auth.middleware";

import ReqValidator from "../middlewares/reqValidator.middleware";
import ParamsValidator from "../middlewares/paramsValidator.middleware";
import {
  createAssessmentSchema,
  submitAssessmentSchema,
  assessmentParamSchema,
} from "../schema/assessment.schema";

const router = express.Router();

// ─── USER ─────────────────────────────
router.get("/", VerifyToken, SubscriberGuard, getAssessmentsHandler);
router.get(
  "/me/assessments",
  VerifyToken,
  SubscriberGuard,
  getUserAssessmentResultsHandler
);
router.get(
  "/:id/detail",
  VerifyToken,
  SubscriberGuard,
  ParamsValidator(assessmentParamSchema),
  getAssessmentDetailHandler
);
router.get(
  "/:id/result",
  VerifyToken,
  SubscriberGuard,
  ParamsValidator(assessmentParamSchema),
  getAssessmentResultByIdHandler
);
router.post(
  "/:id/submit",
  VerifyToken,
  SubscriberGuard,
  ParamsValidator(assessmentParamSchema),
  ReqValidator(submitAssessmentSchema),
  submitAssessmentHandler
);

// ─── DEVELOPER ─────────────────────────────
router.get(
  "/developer/all",
  VerifyToken,
  DeveloperGuard,
  getDeveloperAssessmentsHandler
);
router.post(
  "/",
  VerifyToken,
  DeveloperGuard,
  ReqValidator(createAssessmentSchema),
  createAssessmentHandler
);
router.put(
  "/:id",
  VerifyToken,
  DeveloperGuard,
  ParamsValidator(assessmentParamSchema),
  ReqValidator(createAssessmentSchema),
  updateAssessmentHandler
);
router.delete(
  "/:id",
  VerifyToken,
  DeveloperGuard,
  ParamsValidator(assessmentParamSchema),
  deleteAssessmentHandler
);

export default router;
