import { Router } from "express";
import {
  VerifyToken,
  AdminGuard,
  DeveloperGuard,
} from "../middlewares/auth.middleware";
import {
  getUserDemographicsHandler,
  getSalaryTrendsHandler,
  getApplicantInterestsHandler,
  getAnalyticsOverviewHandler,
  getDeveloperOverview,
} from "../controllers/analytics.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/user-demographics",
  VerifyToken,
  AdminGuard,
  getUserDemographicsHandler
);
router.get("/salary-trends", VerifyToken, AdminGuard, getSalaryTrendsHandler);
router.get(
  "/applicant-interests",
  VerifyToken,
  AdminGuard,
  getApplicantInterestsHandler
);
router.get("/overview", VerifyToken, AdminGuard, getAnalyticsOverviewHandler);
router.get(
  "/developer-overview",
  VerifyToken,
  DeveloperGuard,
  asyncHandler(getDeveloperOverview)
);

export default router;
