"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const preTest_controller_1 = require("../controllers/preTest.controller");
const preTest_schema_1 = require("../schema/preTest.schema");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, (0, reqValidator_middleware_1.default)(preTest_schema_1.createPreSelectionTestSchema), preTest_controller_1.createPreSelectionTestHandler);
router.patch("/:jobId", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, (0, reqValidator_middleware_1.default)(preTest_schema_1.updatePreSelectionTestSchema), preTest_controller_1.updatePreSelectionTestHandler);
router.get("/admin/jobs/:jobId/pre-selection-test", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, preTest_controller_1.getPreSelectionTestByAdminHandler);
router.get("/jobs/:jobId/pre-selection-test", auth_middleware_1.VerifyToken, preTest_controller_1.getPreSelectionTestByJobHandler);
router.post("/jobs/:jobId/pre-selection-test/submit", auth_middleware_1.VerifyToken, (0, reqValidator_middleware_1.default)(preTest_schema_1.submitPreSelectionAnswerSchema), preTest_controller_1.submitPreSelectionAnswerHandler);
router.get("/jobs/:jobId/applicants", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, preTest_controller_1.getApplicantsWithTestResultHandler);
router.get("/:jobId/pre-selection-submitted", auth_middleware_1.VerifyToken, preTest_controller_1.getPreSelectionStatusHandler);
exports.default = router;
