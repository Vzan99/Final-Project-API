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
exports.getDeveloperOverview = void 0;
exports.getUserDemographicsHandler = getUserDemographicsHandler;
exports.getSalaryTrendsHandler = getSalaryTrendsHandler;
exports.getApplicantInterestsHandler = getApplicantInterestsHandler;
exports.getAnalyticsOverviewHandler = getAnalyticsOverviewHandler;
const analytics_service_1 = require("../services/analytics.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
function getUserDemographicsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, analytics_service_1.getUserDemographics)();
            res.json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getSalaryTrendsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, analytics_service_1.getSalaryTrends)();
            res.json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getApplicantInterestsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, analytics_service_1.getApplicantInterests)();
            res.json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getAnalyticsOverviewHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, analytics_service_1.getAnalyticsOverview)();
            res.json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
const getDeveloperOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [totalSubscribers, totalAssessments, avgRating, pendingSubs] = yield Promise.all([
        prisma_1.default.subscription.count({
            where: {
                isApproved: true,
                paymentStatus: "PAID",
                endDate: { gte: new Date() },
            },
        }),
        prisma_1.default.skillAssessment.count(),
        prisma_1.default.companyReview.aggregate({
            _avg: { rating: true },
        }),
        prisma_1.default.subscription.count({
            where: {
                isApproved: false,
            },
        }),
    ]);
    return res.json({
        totalSubscribers,
        totalAssessments,
        avgCompanyReviewRating: (_a = avgRating._avg.rating) !== null && _a !== void 0 ? _a : 0,
        totalPendingSubscriptions: pendingSubs,
    });
});
exports.getDeveloperOverview = getDeveloperOverview;
