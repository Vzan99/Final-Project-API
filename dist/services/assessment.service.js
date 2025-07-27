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
exports.getAssessmentResult = exports.submitAssessment = exports.getAllAssessments = exports.createAssessment = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const uuid_1 = require("uuid");
const qrcode_1 = __importDefault(require("qrcode"));
// Developer creates assessment
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
// User fetches all public assessments
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
// User submits answers to an assessment
const submitAssessment = (assessmentId, userId, userAnswers) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const assessment = yield prisma_1.default.skillAssessment.findUnique({
        where: { id: assessmentId },
    });
    if (!assessment)
        throw new Error("Assessment not found");
    const questions = assessment.questions;
    if (!Array.isArray(questions) || userAnswers.length !== questions.length) {
        throw new Error("Invalid number of answers");
    }
    let correct = 0;
    questions.forEach((q, idx) => {
        if (Array.isArray(q.options) &&
            typeof q.answer === "number" &&
            q.answer >= 0 &&
            q.answer < q.options.length) {
            const correctOption = q.options[q.answer];
            if (userAnswers[idx] === correctOption)
                correct++;
        }
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
        try {
            const verificationCode = (0, uuid_1.v4)();
            const feUrl = process.env.FE_URL || "http://localhost:3000";
            const verificationUrl = `${feUrl}/certificate/verify/${verificationCode}`;
            const qrCodeDataUrl = yield qrcode_1.default.toDataURL(verificationUrl);
            const certificateUrl = `https://dummy-certificate-server.com/cert/${result.id}.pdf`;
            yield prisma_1.default.certificate.create({
                data: {
                    userId,
                    assessmentId,
                    verificationCode,
                    certificateUrl,
                    qrCodeUrl: qrCodeDataUrl,
                },
            });
        }
        catch (_) { }
    }
    return result;
});
exports.submitAssessment = submitAssessment;
// Get result for a specific user-assessment
const getAssessmentResult = (assessmentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.userAssessment.findFirst({
        where: { assessmentId, userId },
    });
});
exports.getAssessmentResult = getAssessmentResult;
