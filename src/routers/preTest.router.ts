import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import {
  createPreSelectionTestHandler,
  getPreSelectionTestByJobHandler,
  submitPreSelectionAnswerHandler,
  getApplicantsWithTestResultHandler,
} from "../controllers/preTest.controller";
import {
  createPreSelectionTestSchema,
  submitPreSelectionAnswerSchema,
} from "../schema/preTest.schema";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AdminGuard,
  ReqValidator(createPreSelectionTestSchema),
  createPreSelectionTestHandler
);

router.get(
  "/jobs/:jobId/pre-selection-test",
  VerifyToken,
  getPreSelectionTestByJobHandler
);

router.post(
  "/jobs/:jobId/pre-selection-test/submit",
  VerifyToken,
  ReqValidator(submitPreSelectionAnswerSchema),
  submitPreSelectionAnswerHandler
);

router.get(
  "/jobs/:jobId/applicants",
  VerifyToken,
  AdminGuard,
  getApplicantsWithTestResultHandler
);

export default router;
