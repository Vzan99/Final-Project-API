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
exports.getUserDemographics = getUserDemographics;
exports.getSalaryTrends = getSalaryTrends;
exports.getApplicantInterests = getApplicantInterests;
exports.getAnalyticsOverview = getAnalyticsOverview;
const prisma_1 = __importDefault(require("../lib/prisma"));
const dayjs_1 = __importDefault(require("dayjs"));
function getUserDemographics() {
    return __awaiter(this, void 0, void 0, function* () {
        const profiles = yield prisma_1.default.profile.findMany({
            select: {
                birthDate: true,
                gender: true,
                address: true,
            },
        });
        const demographics = {
            ageGroups: {
                "18-24": 0,
                "25-34": 0,
                "35-44": 0,
                "45+": 0,
            },
            gender: {},
            location: {},
        };
        const now = (0, dayjs_1.default)();
        for (const profile of profiles) {
            const age = now.diff(profile.birthDate, "year");
            if (age >= 18 && age <= 24)
                demographics.ageGroups["18-24"]++;
            else if (age <= 34)
                demographics.ageGroups["25-34"]++;
            else if (age <= 44)
                demographics.ageGroups["35-44"]++;
            else
                demographics.ageGroups["45+"]++;
            // Gender count
            const g = profile.gender || "Unknown";
            demographics.gender[g] = (demographics.gender[g] || 0) + 1;
            // Location count
            const loc = profile.address || "Unknown";
            demographics.location[loc] = (demographics.location[loc] || 0) + 1;
        }
        return demographics;
    });
}
function getSalaryTrends() {
    return __awaiter(this, void 0, void 0, function* () {
        const applications = yield prisma_1.default.application.findMany({
            where: {
                status: {
                    in: ["REVIEWED", "INTERVIEW", "ACCEPTED"],
                },
            },
            select: {
                expectedSalary: true,
                job: {
                    select: {
                        title: true,
                        location: true,
                    },
                },
            },
        });
        const trends = {};
        for (const app of applications) {
            const key = `${app.job.title} | ${app.job.location}`;
            if (!trends[key])
                trends[key] = { totalSalary: 0, count: 0 };
            trends[key].totalSalary += app.expectedSalary;
            trends[key].count++;
        }
        const result = Object.entries(trends).map(([key, value]) => {
            const [title, location] = key.split(" | ");
            return {
                title,
                location,
                averageSalary: Math.round(value.totalSalary / value.count),
                count: value.count,
            };
        });
        return result;
    });
}
function getApplicantInterests() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const applications = yield prisma_1.default.application.findMany({
            select: {
                job: {
                    select: {
                        jobCategory: true,
                    },
                },
            },
        });
        const interestMap = {};
        for (const app of applications) {
            const category = (_b = (_a = app.job) === null || _a === void 0 ? void 0 : _a.jobCategory) !== null && _b !== void 0 ? _b : "OTHER";
            const readableCategory = category
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase());
            interestMap[readableCategory] = (interestMap[readableCategory] || 0) + 1;
        }
        const result = Object.entries(interestMap).map(([category, count]) => ({
            category,
            totalApplications: count,
        }));
        result.sort((a, b) => b.totalApplications - a.totalApplications);
        return result;
    });
}
function getAnalyticsOverview() {
    return __awaiter(this, void 0, void 0, function* () {
        // Total user by role
        const users = yield prisma_1.default.user.groupBy({
            by: ["role"],
            _count: true,
        });
        // Job aktif
        const totalActiveJobs = yield prisma_1.default.job.count({
            where: { status: "PUBLISHED" },
        });
        // Total aplikasi
        const totalApplications = yield prisma_1.default.application.count();
        // Rata-rata skor pre-selection test
        const preSelectionAvg = yield prisma_1.default.preSelectionAnswer.aggregate({
            _avg: {
                score: true,
            },
        });
        // Rata-rata skor skill assessment
        const skillAssessmentAvg = yield prisma_1.default.userAssessment.aggregate({
            _avg: {
                score: true,
            },
        });
        return {
            userByRole: users.map((u) => ({
                role: u.role,
                total: u._count,
            })),
            totalActiveJobs,
            totalApplications,
            preSelectionAvgScore: Math.round(preSelectionAvg._avg.score || 0),
            skillAssessmentAvgScore: Math.round(skillAssessmentAvg._avg.score || 0),
        };
    });
}
