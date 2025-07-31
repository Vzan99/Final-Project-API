import express from "express";
import {
  createReviewHandler,
  getCompanyReviewsHandler,
  verifyReviewHandler,
} from "../controllers/review.controller";
import {
  AdminGuard,
  UserGuard,
  VerifyToken,
} from "../middlewares/auth.middleware";
import { createReviewSchema, reviewQuerySchema } from "../schema/review.schema";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";

const router = express.Router();

router.post(
  "/",
  VerifyToken,
  UserGuard,
  ReqValidator(createReviewSchema),
  createReviewHandler
);

router.get(
  "/company/:id",
  QueryValidator(reviewQuerySchema),
  getCompanyReviewsHandler
);
router.patch("/:id/verify", VerifyToken, AdminGuard, verifyReviewHandler);

export default router;
