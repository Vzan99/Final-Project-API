"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const cv_controller_1 = require("../controllers/cv.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
// Hanya untuk user dengan subscription aktif
router.use(auth_middleware_1.VerifyToken, auth_middleware_1.UserGuard, (0, asyncHandler_1.asyncHandler)(auth_middleware_1.SubscriberGuard));
router.get("/cv-form", (0, asyncHandler_1.asyncHandler)(cv_controller_1.getCVFormData));
router.post("/generate-cv", (0, asyncHandler_1.asyncHandler)(cv_controller_1.generateCV));
exports.default = router;
