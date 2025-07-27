"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyFilterSchema = void 0;
const zod_1 = require("zod");
exports.companyFilterSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(["name", "location"]).optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    page: zod_1.z
        .string()
        .transform(Number)
        .refine((n) => n > 0, { message: "Page must be greater than 0" })
        .optional()
        .default("1"),
    pageSize: zod_1.z
        .string()
        .transform(Number)
        .refine((n) => n > 0 && n <= 100, {
        message: "Page size must be between 1 and 100",
    })
        .optional()
        .default("10"),
});
