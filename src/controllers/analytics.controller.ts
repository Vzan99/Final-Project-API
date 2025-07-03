import { Request, Response, NextFunction } from "express";
import {
  getUserDemographics,
  getSalaryTrends,
  getApplicantInterests,
  getAnalyticsOverview,
} from "../services/analytics.service";
import prisma from "../lib/prisma";

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

export const getDeveloperOverview = async (req: Request, res: Response) => {
  const [totalSubscribers, totalAssessments, avgRating, pendingSubs] =
    await Promise.all([
      prisma.subscription.count({
        where: {
          isApproved: true,
          paymentStatus: "PAID",
          endDate: { gte: new Date() },
        },
      }),
      prisma.skillAssessment.count(),
      prisma.companyReview.aggregate({
        _avg: { rating: true },
      }),
      prisma.subscription.count({
        where: {
          isApproved: false,
        },
      }),
    ]);

  return res.json({
    totalSubscribers,
    totalAssessments,
    avgCompanyReviewRating: avgRating._avg.rating ?? 0,
    totalPendingSubscriptions: pendingSubs,
  });
};
