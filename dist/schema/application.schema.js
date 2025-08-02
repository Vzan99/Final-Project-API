"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackSchema = exports.ApplicationQuerySchema = exports.ApplyJobSchema = exports.updateApplicationStatusSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.updateApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["REVIEWED", "INTERVIEW", "ACCEPTED", "REJECTED"]),
});
exports.ApplyJobSchema = zod_1.z.object({
    expectedSalary: zod_1.z.number().min(1),
    cvFile: zod_1.z.string().url(),
    coverLetter: zod_1.z.string().optional(),
});
exports.ApplicationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    pageSize: zod_1.z.coerce.number().min(1).max(100).default(10),
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus).optional(),
});
exports.feedbackSchema = zod_1.z.object({
    feedback: zod_1.z.string().min(1, "Feedback must not be empty"),
});
