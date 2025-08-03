"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewQuerySchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    companyId: zod_1.z.string().uuid("Invalid company ID"),
    position: zod_1.z.string().min(2),
    salaryEstimate: zod_1.z.number().min(0),
    content: zod_1.z.string().min(10),
    rating: zod_1.z.number().min(1).max(5),
    cultureRating: zod_1.z.number().min(1).max(5),
    workLifeRating: zod_1.z.number().min(1).max(5),
    careerRating: zod_1.z.number().min(1).max(5),
    isAnonymous: zod_1.z.boolean(),
});
exports.reviewQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .transform(Number)
        .refine((n) => !isNaN(n) && n > 0, { message: "Invalid page number" })
        .optional(),
    pageSize: zod_1.z
        .string()
        .transform(Number)
        .refine((n) => !isNaN(n) && n > 0, { message: "Invalid page size" })
        .optional(),
});
