import { Request, Response, NextFunction } from "express";
import {
  getUserDemographics,
  getSalaryTrends,
  getApplicantInterests,
  getAnalyticsOverview,
} from "../services/analytics.service";

export async function getUserDemographicsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getUserDemographics();
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSalaryTrendsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getSalaryTrends();
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getApplicantInterestsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getApplicantInterests();
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalyticsOverviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getAnalyticsOverview();
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
