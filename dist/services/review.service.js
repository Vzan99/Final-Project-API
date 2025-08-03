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
exports.verifyReview = exports.getCompanyReviews = exports.createReview = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createReview = (userId, input) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.companyReview.create({
        data: Object.assign(Object.assign({}, input), { isVerified: true, userId }),
    });
});
exports.createReview = createReview;
const getCompanyReviews = (companyId, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    const [reviews, total] = yield prisma_1.default.$transaction([
        prisma_1.default.companyReview.findMany({
            where: { companyId, isVerified: true },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                rating: true,
                salaryEstimate: true,
                content: true,
                position: true,
                isAnonymous: true,
                cultureRating: true,
                workLifeRating: true,
                careerRating: true,
                isVerified: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        prisma_1.default.companyReview.count({
            where: { companyId, isVerified: true },
        }),
    ]);
    return { reviews, total };
});
exports.getCompanyReviews = getCompanyReviews;
const verifyReview = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.companyReview.update({
        where: { id },
        data: { isVerified: true },
    });
});
exports.verifyReview = verifyReview;
