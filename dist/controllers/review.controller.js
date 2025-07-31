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
exports.verifyReviewHandler = exports.getCompanyReviewsHandler = exports.createReviewHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const review_service_1 = require("../services/review.service");
exports.createReviewHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const review = yield (0, review_service_1.createReview)(userId, req.body);
    res.status(201).json(review);
}));
exports.getCompanyReviewsHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const { page = 1, pageSize = 3 } = req.validatedQuery || {};
    const reviews = yield (0, review_service_1.getCompanyReviews)(companyId, page, pageSize);
    res.json(reviews);
}));
exports.verifyReviewHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewId = req.params.id;
    const updated = yield (0, review_service_1.verifyReview)(reviewId);
    res.json(updated);
}));
