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
  getAllCategoriesHandler,
  getSavedJobsController,
  checkIsJobSavedHandler,
  saveJobHandler,
  removeSavedJobHandler,
  getJobFiltersMetaHandler,
  GetSuggestedJobsController,
  applyJobHandler,
  getJobDetailViewController,
  getSavedJobsPaginatedController,
} from "../controllers/job.controller";
import {
  createJobSchema,
  updateJobSchema,
  publishJobSchema,
  jobFiltersSchema,
  PaginationSchema,
} from "../schema/job.schema";

const router = Router();

router.get("/public", QueryValidator(jobFiltersSchema), getJobsHandler);

router.get("/categories", getAllCategoriesHandler);

router.get("/filters/meta", getJobFiltersMetaHandler);

router.get("/saved", VerifyToken, UserGuard, getSavedJobsController);

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

router.get("/:id/is-saved", VerifyToken, checkIsJobSavedHandler);

router.post("/:id/save", VerifyToken, saveJobHandler);

router.delete("/:id/save", VerifyToken, removeSavedJobHandler);

router.post(
  "/:id/apply",
  VerifyToken,
  Multer().single("resume"),
  applyJobHandler
);

router.get("/:id/details", getJobDetailViewController);

export default router;
