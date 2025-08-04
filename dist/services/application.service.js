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
exports.getApplicantsByJob = getApplicantsByJob;
exports.getApplicationDetail = getApplicationDetail;
exports.updateApplicationStatus = updateApplicationStatus;
exports.checkIfUserApplied = checkIfUserApplied;
exports.getUserApplicationService = getUserApplicationService;
exports.submitApplicationFeedback = submitApplicationFeedback;
const prisma_1 = __importDefault(require("../lib/prisma"));
function getApplicantsByJob(jobId_1, adminId_1) {
    return __awaiter(this, arguments, void 0, function* (jobId, adminId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            select: { companyId: true, hasTest: true },
        });
        if (!job || job.companyId !== company.id)
            throw new Error("Unauthorized access to this job");
        const [total, applications] = yield Promise.all([
            prisma_1.default.application.count({ where: { jobId } }),
            prisma_1.default.application.findMany({
                where: { jobId },
                skip,
                take: limit,
                include: {
                    job: { select: { id: true, title: true } },
                    user: {
                        include: {
                            profile: true,
                            preSelectionAnswers: {
                                where: { test: { jobId } },
                                include: { test: true },
                            },
                            subscriptions: {
                                where: {
                                    isApproved: true,
                                    paymentStatus: "PAID",
                                    endDate: { gte: new Date() },
                                },
                                orderBy: { endDate: "desc" },
                                take: 1,
                            },
                            interviewSchedules: {
                                where: { jobId },
                                orderBy: { dateTime: "desc" },
                                take: 1,
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            hasTest: job.hasTest,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            applicants: applications.map((app) => {
                var _a, _b, _c, _d;
                const user = app.user;
                const test = user.preSelectionAnswers.find((a) => a.test.jobId === app.jobId);
                const subscription = (_a = user.subscriptions) === null || _a === void 0 ? void 0 : _a[0];
                const latestInterview = (_b = user.interviewSchedules) === null || _b === void 0 ? void 0 : _b[0];
                return {
                    // Data Aplikasi
                    id: app.id,
                    status: app.status,
                    expectedSalary: app.expectedSalary,
                    cvFile: app.cvFile,
                    coverLetter: app.coverLetter,
                    appliedAt: app.createdAt,
                    // Data User
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        profile: user.profile,
                    },
                    // Data Pekerjaan
                    job: {
                        id: app.job.id,
                        title: app.job.title,
                    },
                    // Data Pre-selection Test
                    test: test
                        ? {
                            score: test.score,
                            passed: test.passed,
                            submittedAt: test.createdAt,
                        }
                        : null,
                    // Subscription
                    subscriptionType: (_c = subscription === null || subscription === void 0 ? void 0 : subscription.type) !== null && _c !== void 0 ? _c : null,
                    // Interview
                    interviewStatus: (_d = latestInterview === null || latestInterview === void 0 ? void 0 : latestInterview.status) !== null && _d !== void 0 ? _d : null,
                };
            }),
        };
    });
}
function getApplicationDetail(applicationId, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const application = yield prisma_1.default.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true,
                user: {
                    include: {
                        profile: true,
                        preSelectionAnswers: {
                            include: {
                                test: true,
                            },
                        },
                    },
                },
            },
        });
        if (!application)
            throw new Error("Application not found");
        if (application.job.companyId !== company.id)
            throw new Error("Unauthorized access");
        const test = application.user.preSelectionAnswers.find((a) => a.test.jobId === application.jobId);
        return {
            id: application.id,
            status: application.status,
            expectedSalary: application.expectedSalary,
            cvFile: application.cvFile,
            coverLetter: application.coverLetter,
            appliedAt: application.createdAt,
            user: {
                id: application.user.id,
                name: application.user.name,
                email: application.user.email,
                profile: application.user.profile,
            },
            job: {
                id: application.job.id,
                title: application.job.title,
            },
            test: test
                ? {
                    score: test.score,
                    passed: test.passed,
                    submittedAt: test.createdAt,
                }
                : null,
        };
    });
}
function updateApplicationStatus(applicationId, adminId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const application = yield prisma_1.default.application.findUnique({
            where: { id: applicationId },
            include: { job: true },
        });
        if (!application)
            throw new Error("Application not found");
        if (application.job.companyId !== company.id)
            throw new Error("Unauthorized access");
        const updated = yield prisma_1.default.application.update({
            where: { id: applicationId },
            data: { status: data.status },
        });
        return updated;
    });
}
function checkIfUserApplied(jobId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existing = yield prisma_1.default.application.findFirst({
            where: {
                jobId,
                userId,
            },
        });
        return !!existing;
    });
}
function getUserApplicationService(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, page = 1, pageSize = 10, status) {
        const skip = (page - 1) * pageSize;
        const where = { userId };
        if (status)
            where.status = status;
        const [total, applications] = yield Promise.all([
            prisma_1.default.application.count({ where }),
            prisma_1.default.application.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    feedback: true,
                    job: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                            company: {
                                select: {
                                    admin: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            applications,
        };
    });
}
function submitApplicationFeedback(applicationId, feedback) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!feedback.trim()) {
            throw new Error("Feedback must not be empty");
        }
        const updated = yield prisma_1.default.application.update({
            where: { id: applicationId },
            data: { feedback: feedback.trim() },
        });
        return updated;
    });
}
