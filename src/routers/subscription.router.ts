import { Router } from "express";
import {
  getSubscriptions,
  approveSubscription,
  getSubscriptionOptions,
  subscribe,
  getMySubscription,
  getSubscriptionAnalytics,
  getSubscriptionHistory,
  createMidtransTransaction,
  midtransWebhookHandler,
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
router.use("/developer", VerifyToken, DeveloperGuard);
router.get("/developer", asyncHandler(getSubscriptions));
router.patch("/developer/:id/approve", asyncHandler(approveSubscription));
router.get("/developer/analytics", asyncHandler(getSubscriptionAnalytics));

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
router.post(
  "/user/midtrans/token",
  VerifyToken,
  UserGuard,
  asyncHandler(createMidtransTransaction)
);

// Midtrans webhook (no token)
router.post("/webhook/midtrans", asyncHandler(midtransWebhookHandler));

export default router;
