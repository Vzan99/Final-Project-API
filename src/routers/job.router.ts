import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
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
} from "../controllers/job.controller";
import {
  createJobSchema,
  updateJobSchema,
  publishJobSchema,
  jobFiltersSchema,
} from "../schema/job.schema";

const router = Router();

router.get("/public", QueryValidator(jobFiltersSchema), getJobsHandler);

router.get("/categories", getAllCategoriesHandler);

router.get("/filters/meta", getJobFiltersMetaHandler);

router.get("/saved", VerifyToken, getSavedJobsController);

router.get("/company/:companyId/suggestions", GetSuggestedJobsController);

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

router.get("/:id/is-saved", VerifyToken, checkIsJobSavedHandler);

router.post("/:id/save", VerifyToken, saveJobHandler);

router.delete("/:id/save", VerifyToken, removeSavedJobHandler);

export default router;
