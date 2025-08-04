"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assessment_controller_1 = require("../controllers/assessment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const paramsValidator_middleware_1 = __importDefault(require("../middlewares/paramsValidator.middleware"));
const assessment_schema_1 = require("../schema/assessment.schema");
const router = express_1.default.Router();
// ─── USER ─────────────────────────────
router.get("/", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, assessment_controller_1.getAssessmentsHandler);
router.get("/me/assessments", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, assessment_controller_1.getUserAssessmentResultsHandler);
router.get("/:id/detail", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, (0, paramsValidator_middleware_1.default)(assessment_schema_1.assessmentParamSchema), assessment_controller_1.getAssessmentDetailHandler);
router.get("/:id/result", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, (0, paramsValidator_middleware_1.default)(assessment_schema_1.assessmentParamSchema), assessment_controller_1.getAssessmentResultByIdHandler);
router.post("/:id/submit", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, (0, paramsValidator_middleware_1.default)(assessment_schema_1.assessmentParamSchema), (0, reqValidator_middleware_1.default)(assessment_schema_1.submitAssessmentSchema), assessment_controller_1.submitAssessmentHandler);
router.get("/certificates/:id/preview", auth_middleware_1.VerifyToken, auth_middleware_1.SubscriberGuard, (0, paramsValidator_middleware_1.default)(assessment_schema_1.assessmentParamSchema), assessment_controller_1.previewCertificatePDFHandler);
router.get("/verify/:code", assessment_controller_1.verifyCertificateHandler);
// ─── DEVELOPER ─────────────────────────────
router.get("/developer/all", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, assessment_controller_1.getDeveloperAssessmentsHandler);
router.post("/", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, (0, reqValidator_middleware_1.default)(assessment_schema_1.createAssessmentSchema), assessment_controller_1.createAssessmentHandler);
router.put("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, (0, paramsValidator_middleware_1.default)(assessment_schema_1.assessmentParamSchema), (0, reqValidator_middleware_1.default)(assessment_schema_1.createAssessmentSchema), assessment_controller_1.updateAssessmentHandler);
router.delete("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.DeveloperGuard, (0, paramsValidator_middleware_1.default)(assessment_schema_1.assessmentParamSchema), assessment_controller_1.deleteAssessmentHandler);
exports.default = router;
