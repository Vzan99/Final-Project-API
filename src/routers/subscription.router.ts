import { Router } from "express";
import {
  getSubscriptions,
  approveSubscription,
  getSubscriptionOptions,
  subscribe,
  getMySubscription,
  getSubscriptionAnalytics,
  getSubscriptionHistory,
} from "../controllers/subscription.controller";
import {
  VerifyToken,
  DeveloperGuard,
  UserGuard,
} from "../middlewares/auth.middleware";
import { Multer } from "../utils/multer";
import { asyncHandler } from "../utils/asyncHandler";

const upload = Multer();
const router = Router();

// Developer-only Routes
router.use("/admin", VerifyToken, DeveloperGuard);

router.get("/admin", asyncHandler(getSubscriptions));
router.patch("/admin/:id/approve", asyncHandler(approveSubscription));
router.get("/admin/analytics", asyncHandler(getSubscriptionAnalytics));

// User-only Routes
router.get(
  "/options",
  VerifyToken,
  UserGuard,
  asyncHandler(getSubscriptionOptions)
);
router.get("/user/me", VerifyToken, UserGuard, asyncHandler(getMySubscription));
router.get(
  "/user/history",
  VerifyToken,
  UserGuard,
  asyncHandler(getSubscriptionHistory)
);
router.post(
  "/user/subscribe",
  VerifyToken,
  UserGuard,
  upload.single("paymentProof"),
  asyncHandler(subscribe)
);

export default router;
