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
  rejectSubscriptionHandler,
} from "../controllers/subscription.controller";
import {
  VerifyToken,
  DeveloperGuard,
  UserGuard,
} from "../middlewares/auth.middleware";
import { Multer } from "../utils/multer";
import { asyncHandler } from "../utils/asyncHandler";
import ReqValidator from "../middlewares/reqValidator.middleware";
import ParamsValidator from "../middlewares/paramsValidator.middleware";
import {
  midtransTokenSchema,
  subscriptionIdParamSchema,
  midtransWebhookSchema,
} from "../schema/subscription.schema";

const upload = Multer();
const router = Router();

// Developer-only Routes
router.use("/developer", VerifyToken, DeveloperGuard);
router.get("/developer", asyncHandler(getSubscriptions));
router.patch(
  "/developer/:id/approve",
  ParamsValidator(subscriptionIdParamSchema),
  asyncHandler(approveSubscription)
);
router.patch(
  "/developer/:id/reject",
  ParamsValidator(subscriptionIdParamSchema),
  asyncHandler(rejectSubscriptionHandler)
);
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
  ReqValidator(midtransTokenSchema),
  asyncHandler(createMidtransTransaction)
);

// Midtrans webhook (no token)
router.post(
  "/webhook/midtrans",
  ReqValidator(midtransWebhookSchema),
  asyncHandler(midtransWebhookHandler)
);

export default router;
