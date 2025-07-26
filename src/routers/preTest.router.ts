import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import {
  createPreSelectionTestHandler,
  getPreSelectionTestByJobHandler,
  submitPreSelectionAnswerHandler,
  getApplicantsWithTestResultHandler,
  getPreSelectionStatusHandler,
  updatePreSelectionTestHandler,
  getPreSelectionTestByAdminHandler,
} from "../controllers/preTest.controller";
import {
  createPreSelectionTestSchema,
  submitPreSelectionAnswerSchema,
  updatePreSelectionTestSchema,
} from "../schema/preTest.schema";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AdminGuard,
  ReqValidator(createPreSelectionTestSchema),
  createPreSelectionTestHandler
);

router.patch(
  "/:jobId",
  VerifyToken,
  AdminGuard,
  ReqValidator(updatePreSelectionTestSchema),
  updatePreSelectionTestHandler
);

router.get(
  "/admin/jobs/:jobId/pre-selection-test",
  VerifyToken,
  AdminGuard,
  getPreSelectionTestByAdminHandler
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

router.get(
  "/:jobId/pre-selection-submitted",
  VerifyToken,
  getPreSelectionStatusHandler
);

export default router;
