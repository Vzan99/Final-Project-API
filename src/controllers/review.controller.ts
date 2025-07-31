import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createReview,
  getCompanyReviews,
  verifyReview,
} from "../services/review.service";

export const createReviewHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const review = await createReview(userId, req.body);
    res.status(201).json(review);
  }
);

export const getCompanyReviewsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.params.id;
    const { page = 1, pageSize = 3 } = (req as any).validatedQuery || {};
    const reviews = await getCompanyReviews(companyId, page, pageSize);
    res.json(reviews);
  }
);

export const verifyReviewHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const reviewId = req.params.id;
    const updated = await verifyReview(reviewId);
    res.json(updated);
  }
);
