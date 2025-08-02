"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentParamSchema = exports.submitAssessmentSchema = exports.createAssessmentSchema = void 0;
const zod_1 = require("zod");
// ───── Developer creates new assessment
exports.createAssessmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    passingScore: zod_1.z.number().min(0).max(100).optional(),
    timeLimit: zod_1.z.number().min(1).optional(),
    questions: zod_1.z
        .array(zod_1.z.object({
        question: zod_1.z.string().min(1),
        options: zod_1.z.array(zod_1.z.string().min(1)).min(2).max(6),
        answer: zod_1.z.number().min(0),
    }))
        .min(1),
});
// ───── User submits assessment answers
exports.submitAssessmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        answers: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    }),
});
// ───── Param validation
exports.assessmentParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid assessment ID"),
});
