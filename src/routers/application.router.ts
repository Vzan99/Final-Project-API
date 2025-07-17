import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import {
  getApplicantsByJobHandler,
  getApplicationDetailHandler,
  updateApplicationStatusHandler,
  applyToJobController,
} from "../controllers/application.controller";
import {
  updateApplicationStatusSchema,
  ApplyJobSchema,
} from "../schema/application.schema";

const router = Router();

router.get(
  "/jobs/:jobId/applicants",
  VerifyToken,
  AdminGuard,
  getApplicantsByJobHandler
);
router.get("/:id", VerifyToken, AdminGuard, getApplicationDetailHandler);
router.patch(
  "/:id/status",
  VerifyToken,
  AdminGuard,
  ReqValidator(updateApplicationStatusSchema),
  updateApplicationStatusHandler
);

router.post(
  "/apply/:jobId",
  VerifyToken,
  ReqValidator(ApplyJobSchema),
  applyToJobController
);

export default router;
