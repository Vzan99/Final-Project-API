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
exports.verifyCertificate = exports.streamAssessmentCertificate = exports.getUserAssessmentResult = exports.getUserAssessmentResults = exports.submitAssessment = exports.getAssessmentDetail = exports.getAllAssessments = exports.deleteAssessment = exports.updateAssessment = exports.getDeveloperAssessments = exports.createAssessment = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const uuid_1 = require("uuid");
const qrcode_1 = __importDefault(require("qrcode"));
const PDFhelper_1 = require("../utils/PDFhelper");
// ─── DEVELOPER ─────────────────────────────
const createAssessment = (input, developerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const questionsWithId = input.questions.map((q) => (Object.assign(Object.assign({}, q), { id: (0, uuid_1.v4)() })));
    return prisma_1.default.skillAssessment.create({
        data: {
            name: input.name,
            description: input.description,
            passingScore: (_a = input.passingScore) !== null && _a !== void 0 ? _a : 75,
            timeLimit: (_b = input.timeLimit) !== null && _b !== void 0 ? _b : 30,
            questions: questionsWithId,
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
    var _a, _b;
    const [assessment, subscription, attemptCount, hasPassedBefore] = yield Promise.all([
        prisma_1.default.skillAssessment.findUnique({ where: { id: assessmentId } }),
        prisma_1.default.subscription.findFirst({
            where: {
                userId,
                isApproved: true,
                paymentStatus: "PAID",
            },
            select: { type: true },
        }),
        prisma_1.default.userAssessment.count({
            where: { userId, assessmentId },
        }),
        prisma_1.default.userAssessment.findFirst({
            where: { userId, assessmentId, passed: true },
        }),
    ]);
    if (!assessment)
        throw new Error("Assessment not found");
    const questions = assessment.questions;
    if (!questions || questions.length === 0)
        throw new Error("Soal assessment belum tersedia.");
    if (questions.length !== 25)
        throw new Error("Assessment harus terdiri dari 25 soal.");
    if (userAnswers.length !== questions.length)
        throw new Error("Jumlah jawaban tidak sesuai dengan jumlah soal.");
    if (userAnswers.every((a) => a.selectedAnswer === ""))
        throw new Error("Jawaban kosong tidak bisa disubmit.");
    const maxAllowed = ((_a = subscription === null || subscription === void 0 ? void 0 : subscription.type) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === "PROFESSIONAL" ? Infinity : 2;
    if (attemptCount >= maxAllowed) {
        throw new Error("Batas maksimum percobaan assessment telah tercapai.");
    }
    if (hasPassedBefore) {
        throw new Error("Kamu sudah lulus assessment ini.");
    }
    // Mapping soal berdasarkan ID
    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(q.id, q));
    let correct = 0;
    for (const ans of userAnswers) {
        const q = questionMap.get(ans.questionId);
        if (q && q.options[q.answer] === ans.selectedAnswer)
            correct++;
    }
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= ((_b = assessment.passingScore) !== null && _b !== void 0 ? _b : 75);
    const result = yield prisma_1.default.userAssessment.create({
        data: {
            userId,
            assessmentId,
            score,
            passed,
            badge: passed ? assessment.name : "",
            answers: userAnswers,
        },
    });
    // Jika lulus, generate sertifikat otomatis
    if (passed) {
        const code = (0, uuid_1.v4)();
        const qrData = `${process.env.FE_URL || "http://localhost:3000"}/certificates/verify/${code}`;
        const qrCodeImage = yield qrcode_1.default.toDataURL(qrData);
        yield prisma_1.default.certificate.create({
            data: {
                userId,
                assessmentId,
                issuedAt: new Date(),
                verificationCode: code,
                qrCodeUrl: qrCodeImage,
                certificateUrl: "", // opsional: bisa isi URL API download kalau mau
            },
        });
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
    var _a, _b, _c, _d, _e, _f, _g;
    const [assessment, result, cert, attemptCount, subscription] = yield Promise.all([
        prisma_1.default.skillAssessment.findUnique({
            where: { id: assessmentId },
            select: { name: true },
        }),
        prisma_1.default.userAssessment.findFirst({
            where: { userId, assessmentId },
        }),
        prisma_1.default.certificate.findFirst({
            where: { userId, assessmentId },
        }),
        prisma_1.default.userAssessment.count({
            where: { userId, assessmentId },
        }),
        prisma_1.default.subscription.findFirst({
            where: {
                userId,
                isApproved: true,
                paymentStatus: "PAID",
            },
            select: { type: true },
        }),
    ]);
    const maxAllowedAttempts = ((_a = subscription === null || subscription === void 0 ? void 0 : subscription.type) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === "PROFESSIONAL" ? Infinity : 2;
    return {
        id: (_b = result === null || result === void 0 ? void 0 : result.id) !== null && _b !== void 0 ? _b : null,
        score: (_c = result === null || result === void 0 ? void 0 : result.score) !== null && _c !== void 0 ? _c : null,
        passed: (_d = result === null || result === void 0 ? void 0 : result.passed) !== null && _d !== void 0 ? _d : null,
        badge: (_e = result === null || result === void 0 ? void 0 : result.badge) !== null && _e !== void 0 ? _e : null,
        certificateId: (_f = cert === null || cert === void 0 ? void 0 : cert.id) !== null && _f !== void 0 ? _f : null,
        totalAttempts: attemptCount,
        maxAllowedAttempts,
        assessmentTitle: (_g = assessment === null || assessment === void 0 ? void 0 : assessment.name) !== null && _g !== void 0 ? _g : null,
    };
});
exports.getUserAssessmentResult = getUserAssessmentResult;
const streamAssessmentCertificate = (userId, certificateId, res) => __awaiter(void 0, void 0, void 0, function* () {
    const certificate = yield prisma_1.default.certificate.findFirst({
        where: { id: certificateId, userId },
        include: {
            user: { select: { name: true } },
            assessment: { select: { name: true } },
        },
    });
    if (!certificate)
        throw new Error("Certificate not found");
    yield (0, PDFhelper_1.streamCertificatePdf)({
        certificate: {
            user: certificate.user,
            assessment: certificate.assessment,
            createdAt: certificate.issuedAt,
            code: certificate.verificationCode,
        },
        res,
    });
});
exports.streamAssessmentCertificate = streamAssessmentCertificate;
const verifyCertificate = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const certificate = yield prisma_1.default.certificate.findFirst({
        where: { verificationCode: code },
        include: {
            user: {
                select: { name: true, email: true },
            },
            assessment: {
                select: { name: true },
            },
        },
    });
    if (!certificate)
        return null;
    const baseUrl = process.env.FE_URL || "http://localhost:3000";
    return {
        id: certificate.id,
        issuedAt: certificate.issuedAt,
        user: certificate.user,
        assessment: certificate.assessment,
        qrCodeUrl: `${baseUrl}/certificates/verify/${code}`,
        certificateUrl: `${baseUrl}/api/preview/certificates/${certificate.id}`,
    };
});
exports.verifyCertificate = verifyCertificate;
