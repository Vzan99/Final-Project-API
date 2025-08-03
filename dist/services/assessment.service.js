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
exports.getUserAssessmentResult = exports.getUserAssessmentResults = exports.submitAssessment = exports.getAssessmentDetail = exports.getAllAssessments = exports.deleteAssessment = exports.updateAssessment = exports.getDeveloperAssessments = exports.createAssessment = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const uuid_1 = require("uuid");
const qrcode_1 = __importDefault(require("qrcode"));
const generateCertificatePDF_1 = require("../utils/generateCertificatePDF");
// ─── DEVELOPER ─────────────────────────────
const createAssessment = (input, developerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    return prisma_1.default.skillAssessment.create({
        data: {
            name: input.name,
            description: input.description,
            passingScore: (_a = input.passingScore) !== null && _a !== void 0 ? _a : 75,
            timeLimit: (_b = input.timeLimit) !== null && _b !== void 0 ? _b : 30,
            questions: input.questions,
            developerId,
        },
    });
});
exports.createAssessment = createAssessment;
const getDeveloperAssessments = (developerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.skillAssessment.findMany({ where: { developerId } });
});
exports.getDeveloperAssessments = getDeveloperAssessments;
const updateAssessment = (assessmentId, developerId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.skillAssessment.findUnique({
        where: { id: assessmentId },
        include: { userAssessments: true },
    });
    if (!existing || existing.developerId !== developerId)
        throw new Error("Assessment not found");
    if (existing.userAssessments.length > 0)
        throw new Error("Assessment sudah dikerjakan dan tidak bisa diubah");
    return prisma_1.default.skillAssessment.update({ where: { id: assessmentId }, data });
});
exports.updateAssessment = updateAssessment;
const deleteAssessment = (assessmentId, developerId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.skillAssessment.findUnique({
        where: { id: assessmentId },
        include: { userAssessments: true },
    });
    if (!existing || existing.developerId !== developerId)
        throw new Error("Assessment not found");
    if (existing.userAssessments.length > 0)
        throw new Error("Assessment sudah dikerjakan dan tidak bisa dihapus");
    return prisma_1.default.skillAssessment.delete({ where: { id: assessmentId } });
});
exports.deleteAssessment = deleteAssessment;
// ─── USER ─────────────────────────────
const getAllAssessments = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.skillAssessment.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            description: true,
            timeLimit: true,
        },
    });
});
exports.getAllAssessments = getAllAssessments;
const getAssessmentDetail = (assessmentId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.skillAssessment.findUnique({
        where: { id: assessmentId },
        select: {
            id: true,
            name: true,
            description: true,
            timeLimit: true,
            questions: true,
        },
    });
});
exports.getAssessmentDetail = getAssessmentDetail;
const submitAssessment = (assessmentId, userId, userAnswers) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existing = yield prisma_1.default.userAssessment.findFirst({
        where: { userId, assessmentId },
    });
    if (existing)
        throw new Error("Assessment sudah pernah dikerjakan");
    const assessment = yield prisma_1.default.skillAssessment.findUnique({
        where: { id: assessmentId },
    });
    if (!assessment)
        throw new Error("Assessment not found");
    const questions = assessment.questions;
    if (userAnswers.length !== questions.length)
        throw new Error("Jumlah jawaban tidak sesuai");
    let correct = 0;
    questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.options[q.answer])
            correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= ((_a = assessment.passingScore) !== null && _a !== void 0 ? _a : 75);
    const result = yield prisma_1.default.userAssessment.create({
        data: {
            userId,
            assessmentId,
            score,
            passed,
            answers: userAnswers,
            badge: passed ? assessment.name : "",
        },
    });
    if (passed) {
        const verificationCode = (0, uuid_1.v4)();
        const feUrl = process.env.FE_URL || "http://localhost:3000";
        const qrCodeDataUrl = yield qrcode_1.default.toDataURL(`${feUrl}/certificates/verify/${verificationCode}`);
        const certificate = yield prisma_1.default.certificate.create({
            data: {
                userId,
                assessmentId,
                verificationCode,
                certificateUrl: `${feUrl}/certificates/${result.id}.pdf`,
                qrCodeUrl: qrCodeDataUrl,
            },
            include: {
                user: { select: { name: true } },
                assessment: { select: { name: true } },
            },
        });
        yield (0, generateCertificatePDF_1.generateAndSaveCertificatePdf)({ certificate });
    }
    return result;
});
exports.submitAssessment = submitAssessment;
const getUserAssessmentResults = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield prisma_1.default.userAssessment.findMany({
        where: { userId },
        include: { assessment: { select: { id: true, name: true } } },
    });
    const certificates = yield prisma_1.default.certificate.findMany({
        where: { userId },
        select: {
            assessmentId: true,
            certificateUrl: true,
            issuedAt: true,
            qrCodeUrl: true,
            id: true,
        },
    });
    return results.map((r) => {
        var _a, _b, _c, _d;
        const cert = certificates.find((c) => c.assessmentId === r.assessmentId);
        return {
            id: r.id,
            assessmentId: r.assessmentId,
            assessmentName: r.assessment.name,
            score: r.score,
            passed: r.passed,
            badge: r.badge,
            certificateId: (_a = cert === null || cert === void 0 ? void 0 : cert.id) !== null && _a !== void 0 ? _a : null,
            certificateUrl: (_b = cert === null || cert === void 0 ? void 0 : cert.certificateUrl) !== null && _b !== void 0 ? _b : null,
            issuedAt: (_c = cert === null || cert === void 0 ? void 0 : cert.issuedAt) !== null && _c !== void 0 ? _c : null,
            qrCodeUrl: (_d = cert === null || cert === void 0 ? void 0 : cert.qrCodeUrl) !== null && _d !== void 0 ? _d : null,
        };
    });
});
exports.getUserAssessmentResults = getUserAssessmentResults;
const getUserAssessmentResult = (userId, assessmentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield prisma_1.default.userAssessment.findFirst({
        where: { userId, assessmentId },
    });
    if (!result)
        return null;
    const cert = yield prisma_1.default.certificate.findFirst({
        where: { userId, assessmentId },
    });
    return {
        id: result.id,
        score: result.score,
        passed: result.passed,
        badge: result.badge,
        certificateId: (_a = cert === null || cert === void 0 ? void 0 : cert.id) !== null && _a !== void 0 ? _a : null,
    };
});
exports.getUserAssessmentResult = getUserAssessmentResult;
