import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import {
  createJobHandler,
  getJobsByAdminHandler,
  getJobDetailHandler,
  updateJobHandler,
  deleteJobHandler,
  updateJobStatusHandler,
} from "../controllers/job.controller";
import {
  createJobSchema,
  updateJobSchema,
  publishJobSchema,
} from "../schema/job.schema";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AdminGuard,
  ReqValidator(createJobSchema),
  createJobHandler
);
router.get("/", VerifyToken, AdminGuard, getJobsByAdminHandler);
router.get("/:id", VerifyToken, AdminGuard, getJobDetailHandler);
router.patch(
  "/:id",
  VerifyToken,
  AdminGuard,
  ReqValidator(updateJobSchema),
  updateJobHandler
);
router.delete("/:id", VerifyToken, AdminGuard, deleteJobHandler);
router.patch(
  "/:id/publish",
  VerifyToken,
  AdminGuard,
  ReqValidator(publishJobSchema),
  updateJobStatusHandler
);

export default router;
