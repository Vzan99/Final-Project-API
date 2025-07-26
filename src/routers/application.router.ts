import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import { ApplicationQuerySchema } from "../schema/application.schema";
import {
  getApplicantsByJobHandler,
  getApplicationDetailHandler,
  updateApplicationStatusHandler,
  checkApplicationStatusHandler,
  getUserApplicationsController,
} from "../controllers/application.controller";
import {
  updateApplicationStatusSchema,
  ApplyJobSchema,
} from "../schema/application.schema";
import { UserGuard } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/user",
  VerifyToken,
  UserGuard,
  QueryValidator(ApplicationQuerySchema),
  getUserApplicationsController
);

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

router.get(
  "/:jobId/status",
  VerifyToken,
  UserGuard,
  checkApplicationStatusHandler
);

export default router;
