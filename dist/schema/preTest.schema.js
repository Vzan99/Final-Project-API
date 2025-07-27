"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPreSelectionAnswerSchema = exports.updatePreSelectionTestSchema = exports.createPreSelectionTestSchema = void 0;
const zod_1 = require("zod");
exports.createPreSelectionTestSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid(),
    questions: zod_1.z
        .array(zod_1.z.object({
        question: zod_1.z.string().min(1),
        options: zod_1.z.array(zod_1.z.string()).length(4),
        correctIndex: zod_1.z.number().int().min(0).max(3),
    }))
        .length(25),
});
exports.updatePreSelectionTestSchema = zod_1.z.object({
    questions: zod_1.z
        .array(zod_1.z.object({
        index: zod_1.z.number().int().min(0).max(24),
        question: zod_1.z.string().min(1),
        options: zod_1.z.array(zod_1.z.string()).length(4),
        correctIndex: zod_1.z.number().int().min(0).max(3),
    }))
        .min(1),
});
exports.submitPreSelectionAnswerSchema = zod_1.z.object({
    answers: zod_1.z.array(zod_1.z.number().int().min(0).max(3)).length(25),
});
