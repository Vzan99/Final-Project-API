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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreSelectionTest = createPreSelectionTest;
exports.updatePreSelectionTest = updatePreSelectionTest;
exports.getPreSelectionTestDetailByAdmin = getPreSelectionTestDetailByAdmin;
exports.getPreSelectionTestByJob = getPreSelectionTestByJob;
exports.submitPreSelectionAnswer = submitPreSelectionAnswer;
exports.getApplicantsWithTestResult = getApplicantsWithTestResult;
exports.checkPreSelectionStatus = checkPreSelectionStatus;
const prisma_1 = __importDefault(require("../lib/prisma"));
function createPreSelectionTest(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { jobId, questions } = data;
        const job = yield prisma_1.default.job.findUnique({ where: { id: jobId } });
        if (!job)
            throw new Error("Job not found");
        if (!job.hasTest) {
            throw new Error("This job is not configured to use pre-selection test");
        }
        const existingTest = yield prisma_1.default.preSelectionTest.findUnique({
            where: { jobId },
        });
        if (existingTest)
            throw new Error("Test for this job already exists");
        const newTest = yield prisma_1.default.preSelectionTest.create({
            data: {
                jobId,
                questions,
            },
        });
        return newTest;
    });
}
function updatePreSelectionTest(jobId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingTest = yield prisma_1.default.preSelectionTest.findUnique({
            where: { jobId },
        });
        if (!existingTest) {
            throw new Error("Pre-selection test not found");
        }
        const currentQuestions = existingTest.questions;
        for (const update of data.questions) {
            const { index, question, options, correctIndex } = update;
            if (index < 0 || index >= currentQuestions.length) {
                throw new Error(`Invalid index: ${index}`);
            }
            currentQuestions[index] = {
                question,
                options,
                correctIndex,
            };
        }
        const updatedTest = yield prisma_1.default.preSelectionTest.update({
            where: { jobId },
            data: {
                questions: currentQuestions,
            },
        });
        return updatedTest;
    });
}
function getPreSelectionTestDetailByAdmin(jobId, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            include: {
                preSelectionTest: true,
            },
        });
        if (!job || job.companyId !== company.id)
            throw new Error("Test not found or access denied");
        const test = job.preSelectionTest;
        if (!test) {
            return {
                jobId: job.id,
                testId: null,
                questions: [],
            };
        }
        const questions = test.questions;
        return {
            jobId: job.id,
            testId: test.id,
            questions,
        };
    });
}
function getPreSelectionTestByJob(jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            include: { preSelectionTest: true },
        });
        if (!job || !job.hasTest || !job.preSelectionTest)
            throw new Error("No pre-selection test found for this job");
        const test = job.preSelectionTest;
        const rawQuestions = test.questions;
        const questions = rawQuestions.map((q) => {
            const { correctIndex } = q, rest = __rest(q, ["correctIndex"]);
            return rest;
        });
        return {
            jobId,
            testId: test.id,
            questions,
        };
    });
}
function submitPreSelectionAnswer(jobId, userId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            include: { preSelectionTest: true },
        });
        if (!job || !job.hasTest || !job.preSelectionTest) {
            throw new Error("Pre-selection test not available for this job.");
        }
        const test = job.preSelectionTest;
        const existing = yield prisma_1.default.preSelectionAnswer.findUnique({
            where: {
                userId_testId: {
                    userId,
                    testId: test.id,
                },
            },
        });
        if (existing)
            throw new Error("You have already submitted this test.");
        const correctAnswers = test.questions.map((q) => q.correctIndex);
        const userAnswers = payload.answers;
        let score = 0;
        correctAnswers.forEach((correct, i) => {
            if (userAnswers[i] === correct)
                score++;
        });
        const percentage = (score / 25) * 100;
        const passed = percentage >= 75;
        const saved = yield prisma_1.default.preSelectionAnswer.create({
            data: {
                userId,
                testId: test.id,
                score: percentage,
                passed,
                answers: userAnswers,
            },
        });
        return {
            score,
            passed,
            total: 25,
            correct: score,
        };
    });
}
function getApplicantsWithTestResult(jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        const applications = yield prisma_1.default.application.findMany({
            where: { jobId },
            include: {
                user: {
                    include: {
                        profile: true,
                        preSelectionAnswers: {
                            where: {
                                test: {
                                    jobId,
                                },
                            },
                        },
                    },
                },
            },
        });
        return applications.map((app) => {
            var _a, _b, _c, _d, _e;
            const user = app.user;
            const profile = user.profile;
            const test = user.preSelectionAnswers[0];
            return {
                name: user.name,
                email: user.email,
                photoUrl: (_a = profile === null || profile === void 0 ? void 0 : profile.photoUrl) !== null && _a !== void 0 ? _a : null,
                education: (_b = profile === null || profile === void 0 ? void 0 : profile.education) !== null && _b !== void 0 ? _b : null,
                expectedSalary: app.expectedSalary,
                status: app.status,
                cvFile: app.cvFile,
                testScore: (_c = test === null || test === void 0 ? void 0 : test.score) !== null && _c !== void 0 ? _c : null,
                passed: (_d = test === null || test === void 0 ? void 0 : test.passed) !== null && _d !== void 0 ? _d : null,
                submittedAt: (_e = test === null || test === void 0 ? void 0 : test.createdAt) !== null && _e !== void 0 ? _e : null,
            };
        });
    });
}
function checkPreSelectionStatus(jobId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            include: { preSelectionTest: true },
        });
        if (!job || !job.hasTest || !job.preSelectionTest) {
            return { submitted: false };
        }
        const testId = job.preSelectionTest.id;
        const answer = yield prisma_1.default.preSelectionAnswer.findUnique({
            where: {
                userId_testId: {
                    userId,
                    testId,
                },
            },
        });
        if (!answer)
            return { submitted: false };
        return {
            submitted: true,
            score: answer.score,
            passed: answer.passed,
            total: 25,
            submittedAt: answer.createdAt,
        };
    });
}
