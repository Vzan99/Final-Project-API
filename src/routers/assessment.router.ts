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

import ReqValidator from "../middlewares/reqValidator.middleware";
import ParamsValidator from "../middlewares/paramsValidator.middleware";

import {
  createAssessmentSchema,
  submitAssessmentSchema,
  assessmentParamSchema,
} from "../schema/assessment.schema";

const router = express.Router();

// ───── USER with Subscription
router.get("/", VerifyToken, SubscriberGuard, getAssessmentsHandler);

router.post(
  "/:id/submit",
  VerifyToken,
  SubscriberGuard,
  ParamsValidator(assessmentParamSchema),
  ReqValidator(submitAssessmentSchema),
  submitAssessmentHandler
);

router.get(
  "/:id/result",
  VerifyToken,
  SubscriberGuard,
  ParamsValidator(assessmentParamSchema),
  getAssessmentResultHandler
);

router.get(
  "/:id/detail",
  VerifyToken,
  SubscriberGuard,
  ParamsValidator(assessmentParamSchema),
  getAssessmentDetailHandler
);

// ───── DEVELOPER only
router.post(
  "/",
  VerifyToken,
  DeveloperGuard,
  ReqValidator(createAssessmentSchema),
  createAssessmentHandler
);

router.get(
  "/developer/all",
  VerifyToken,
  DeveloperGuard,
  getDeveloperAssessmentsHandler
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
