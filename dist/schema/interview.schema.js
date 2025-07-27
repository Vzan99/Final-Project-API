"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInterviewStatusSchema = exports.updateInterviewSchema = exports.createInterviewSchema = void 0;
const zod_1 = require("zod");
exports.createInterviewSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    dateTime: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    location: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateInterviewSchema = zod_1.z.object({
    dateTime: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    })
        .optional(),
    location: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"])
        .optional(),
});
exports.updateInterviewStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["COMPLETED", "CANCELLED", "RESCHEDULED"]),
});
