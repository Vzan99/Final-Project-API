"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assessment_controller_1 = require("../controllers/assessment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// ─────────────────────────────────────────────────────────
// USER with subscription
router.get("/", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, assessment_controller_1.getAssessmentsHandler);
router.post("/:id/submit", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, assessment_controller_1.submitAssessmentHandler);
router.get("/:id/result", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, assessment_controller_1.getAssessmentResultHandler);
router.get("/:id/detail", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, assessment_controller_1.getAssessmentDetailHandler);
// ─────────────────────────────────────────────────────────
// DEVELOPER only
router.post("/", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, assessment_controller_1.createAssessmentHandler);
router.get("/developer/all", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, assessment_controller_1.getDeveloperAssessmentsHandler);
router.put("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, assessment_controller_1.updateAssessmentHandler);
router.delete("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, assessment_controller_1.deleteAssessmentHandler);
exports.default = router;
