import { Router } from "express";
import { Multer } from "../utils/multer";
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
import { publishJobSchema } from "../schema/job.schema";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AdminGuard,
  Multer().single("banner"),
  createJobHandler
);
router.get("/", VerifyToken, AdminGuard, getJobsByAdminHandler);
router.get("/:id", VerifyToken, AdminGuard, getJobDetailHandler);
router.patch(
  "/:id",
  VerifyToken,
  AdminGuard,
  Multer().single("banner"),
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
