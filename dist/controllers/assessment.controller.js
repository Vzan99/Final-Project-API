"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAssessmentHandler = exports.updateAssessmentHandler = exports.getDeveloperAssessmentsHandler = exports.getAssessmentDetailHandler = exports.getAssessmentResultHandler = exports.submitAssessmentHandler = exports.getAssessmentsHandler = exports.createAssessmentHandler = void 0;
const assessment_service_1 = require("../services/assessment.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const asyncHandler_1 = require("../utils/asyncHandler");
// ─────────────────────────────────────────────────────────
// Developer-only: Create new assessment
exports.createAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const developerId = req.user.id;
    const data = yield (0, assessment_service_1.createAssessment)(req.body, developerId);
    res.status(201).json(data);
}));
// Subscribed user: Get all active public assessments
exports.getAssessmentsHandler = (0, asyncHandler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessments = yield (0, assessment_service_1.getAllAssessments)();
    res.json(assessments);
}));
// Subscribed user: Submit answers to an assessment
exports.submitAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { id } = req.params;
    const data = yield (0, assessment_service_1.submitAssessment)(id, userId, req.body.answers);
    res.json(data);
}));
// Subscribed user: Get result for a submitted assessment
exports.getAssessmentResultHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { id } = req.params;
    const result = yield (0, assessment_service_1.getAssessmentResult)(id, userId);
    if (!result) {
        return res
            .status(404)
            .json({
            message: "Result not found. User may not have submitted this assessment.",
        });
    }
    res.json(result);
}));
// Subscribed user: Get assessment detail (with questions)
exports.getAssessmentDetailHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const assessment = yield prisma_1.default.skillAssessment.findUnique({
        where: { id },
    });
    if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
    }
    res.json(assessment);
}));
// Developer-only: Get all assessments created by developer
exports.getDeveloperAssessmentsHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const developerId = req.user.id;
    const assessments = yield prisma_1.default.skillAssessment.findMany({
        where: { developerId },
    });
    res.json(assessments);
}));
// Developer-only: Update assessment
exports.updateAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const developerId = req.user.id;
    const { id } = req.params;
    const existing = yield prisma_1.default.skillAssessment.findUnique({
        where: { id },
    });
    if (!existing || existing.developerId !== developerId) {
        return res.status(404).json({ message: "Assessment not found" });
    }
    const updated = yield prisma_1.default.skillAssessment.update({
        where: { id },
        data: req.body,
    });
    res.json(updated);
}));
// Developer-only: Delete assessment
exports.deleteAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const developerId = req.user.id;
    const { id } = req.params;
    const existing = yield prisma_1.default.skillAssessment.findUnique({
        where: { id },
    });
    if (!existing || existing.developerId !== developerId) {
        return res.status(404).json({ message: "Assessment not found" });
    }
    yield prisma_1.default.skillAssessment.delete({ where: { id } });
    res.json({ message: "Assessment deleted" });
}));
