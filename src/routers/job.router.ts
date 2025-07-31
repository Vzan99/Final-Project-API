import { Router } from "express";
import { Multer } from "../utils/multer";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";
import {
  VerifyToken,
  AdminGuard,
  UserGuard,
} from "../middlewares/auth.middleware";
import {
  createJobHandler,
  getJobsByAdminHandler,
  getJobDetailHandler,
  updateJobHandler,
  deleteJobHandler,
  updateJobStatusHandler,
  getJobsHandler,
  getSavedJobsController,
  checkIsJobSavedHandler,
  saveJobHandler,
  removeSavedJobHandler,
  getJobFiltersMetaHandler,
  GetSuggestedJobsController,
  applyJobHandler,
  getJobDetailViewController,
  getSavedJobsPaginatedController,
  getNearbyJobsController,
} from "../controllers/job.controller";
import {
  createJobSchema,
  updateJobSchema,
  publishJobSchema,
  jobFiltersSchema,
  PaginationSchema,
  nearbyJobsQuerySchema,
} from "../schema/job.schema";

const router = Router();

router.get("/public", QueryValidator(jobFiltersSchema), getJobsHandler);

router.get("/filters/meta", getJobFiltersMetaHandler);

router.get("/saved", VerifyToken, UserGuard, getSavedJobsController);

router.get(
  "/nearby",
  QueryValidator(nearbyJobsQuerySchema),
  getNearbyJobsController
);

router.get(
  "/saved/paginated",
  VerifyToken,
  UserGuard,
  QueryValidator(PaginationSchema),
  getSavedJobsPaginatedController
);

router.get("/company/:companyId/suggestions", GetSuggestedJobsController);

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

router.get("/:id/is-saved", VerifyToken, UserGuard, checkIsJobSavedHandler);

router.post("/:id/save", VerifyToken, UserGuard, saveJobHandler);

router.delete("/:id/save", VerifyToken, UserGuard, removeSavedJobHandler);

router.post(
  "/:id/apply",
  VerifyToken,
  UserGuard,
  Multer().single("resume"),
  applyJobHandler
);

router.get("/:id/details", getJobDetailViewController);

export default router;
