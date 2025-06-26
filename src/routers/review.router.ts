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

const router = express.Router();

router.post("/", VerifyToken, UserGuard, createReviewHandler);
router.get("/company/:id", getCompanyReviewsHandler);
router.patch("/:id/verify", VerifyToken, AdminGuard, verifyReviewHandler);

export default router;
