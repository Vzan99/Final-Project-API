"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../utils/multer");
const asyncHandler_1 = require("../utils/asyncHandler");
const upload = (0, multer_1.Multer)();
const router = (0, express_1.Router)();
// Developer-only Routes
router.use("/developer", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard);
router.get("/developer", (0, asyncHandler_1.asyncHandler)(subscription_controller_1.getSubscriptions));
router.patch("/developer/:id/approve", (0, asyncHandler_1.asyncHandler)(subscription_controller_1.approveSubscription));
router.get("/developer/analytics", (0, asyncHandler_1.asyncHandler)(subscription_controller_1.getSubscriptionAnalytics));
// User-only Routes
router.get("/options", auth_middleware_1.VerifyToken, auth_middleware_1.UserGuard, (0, asyncHandler_1.asyncHandler)(subscription_controller_1.getSubscriptionOptions));
router.get("/user/me", auth_middleware_1.VerifyToken, auth_middleware_1.UserGuard, (0, asyncHandler_1.asyncHandler)(subscription_controller_1.getMySubscription));
router.get("/user/history", auth_middleware_1.VerifyToken, auth_middleware_1.UserGuard, (0, asyncHandler_1.asyncHandler)(subscription_controller_1.getSubscriptionHistory));
router.post("/user/subscribe", auth_middleware_1.VerifyToken, auth_middleware_1.UserGuard, upload.single("paymentProof"), (0, asyncHandler_1.asyncHandler)(subscription_controller_1.subscribe));
router.post("/user/midtrans/token", auth_middleware_1.VerifyToken, auth_middleware_1.UserGuard, (0, asyncHandler_1.asyncHandler)(subscription_controller_1.createMidtransTransaction));
// Midtrans webhook (no token)
router.post("/webhook/midtrans", (0, asyncHandler_1.asyncHandler)(subscription_controller_1.midtransWebhookHandler));
exports.default = router;
