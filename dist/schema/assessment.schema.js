"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentParamSchema = exports.submitAssessmentSchema = exports.updateAssessmentSchema = exports.createAssessmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssessmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    passingScore: zod_1.z.number().min(0).max(100),
    timeLimit: zod_1.z.number().min(1),
    questions: zod_1.z
        .array(zod_1.z.object({
        question: zod_1.z.string().min(5),
        options: zod_1.z
            .array(zod_1.z.string().min(1))
            .min(2, "Minimal 2 opsi")
            .max(6, "Maksimal 6 opsi"),
        answer: zod_1.z.number().min(0, "Answer must be valid"),
    }))
        .min(25, "Jumlah soal harus 25")
        .min(1)
        .superRefine((qs, ctx) => {
        qs.forEach((q, i) => {
            if (q.answer >= q.options.length) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Index jawaban di luar batas opsi",
                    path: [i, "answer"],
                });
            }
        });
    }),
});
exports.updateAssessmentSchema = exports.createAssessmentSchema.partial();
exports.submitAssessmentSchema = zod_1.z.object({
    answers: zod_1.z
        .array(zod_1.z.object({
        questionId: zod_1.z.string().uuid(),
        selectedAnswer: zod_1.z.string(),
    }))
        .min(1),
});
exports.assessmentParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: "Invalid assessment ID format" }),
});
