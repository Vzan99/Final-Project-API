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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificateHandler = exports.previewCertificatePDFHandler = exports.deleteAssessmentHandler = exports.updateAssessmentHandler = exports.getDeveloperAssessmentsHandler = exports.createAssessmentHandler = exports.getAssessmentResultByIdHandler = exports.getUserAssessmentResultsHandler = exports.getAssessmentDetailHandler = exports.submitAssessmentHandler = exports.getAssessmentsHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const assessment_service_1 = require("../services/assessment.service");
exports.getAssessmentsHandler = (0, asyncHandler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, assessment_service_1.getAllAssessments)();
    res.json(data);
}));
exports.submitAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, assessment_service_1.submitAssessment)(req.params.id, req.user.id, req.body.answers);
    res.json(result);
}));
exports.getAssessmentDetailHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessment = yield (0, assessment_service_1.getAssessmentDetail)(req.params.id);
    if (!assessment)
        return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
}));
exports.getUserAssessmentResultsHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, assessment_service_1.getUserAssessmentResults)(req.user.id);
    res.json(data);
}));
exports.getAssessmentResultByIdHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, assessment_service_1.getUserAssessmentResult)(req.user.id, req.params.id);
    if (!result)
        return res.status(404).json({ message: "Result not found" });
    res.json(result);
}));
exports.createAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, assessment_service_1.createAssessment)(req.body, req.user.id);
    res.status(201).json(data);
}));
exports.getDeveloperAssessmentsHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, assessment_service_1.getDeveloperAssessments)(req.user.id);
    res.json(data);
}));
exports.updateAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, assessment_service_1.updateAssessment)(req.params.id, req.user.id, req.body);
    res.json(data);
}));
exports.deleteAssessmentHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, assessment_service_1.deleteAssessment)(req.params.id, req.user.id);
    res.json({ message: "Assessment deleted" });
}));
exports.previewCertificatePDFHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, assessment_service_1.streamAssessmentCertificate)(req.user.id, req.params.id, res);
}));
exports.verifyCertificateHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.params;
    const data = yield (0, assessment_service_1.verifyCertificate)(code);
    if (!data)
        return res.status(404).json({ message: "Certificate not found" });
    res.json(data);
}));
