import { Router } from "express";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import {
  getUserDemographicsHandler,
  getSalaryTrendsHandler,
  getApplicantInterestsHandler,
  getAnalyticsOverviewHandler,
} from "../controllers/analytics.controller";

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

export default router;
