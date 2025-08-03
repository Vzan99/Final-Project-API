"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentParamSchema = exports.submitAssessmentSchema = exports.createAssessmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssessmentSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(3, "Nama assessment minimal 3 karakter"),
    description: zod_1.z.string().optional(),
    passingScore: zod_1.z.number().min(0).max(100).optional(),
    timeLimit: zod_1.z.number().min(1).optional(),
    questions: zod_1.z
        .array(zod_1.z
        .object({
        question: zod_1.z.string().trim().min(1, "Pertanyaan tidak boleh kosong"),
        options: zod_1.z
            .array(zod_1.z.string().trim().min(1, "Opsi tidak boleh kosong"))
            .min(2, "Minimal harus ada 2 opsi")
            .max(6, "Maksimal 6 opsi"),
        answer: zod_1.z.number().min(0, "Jawaban harus berupa indeks >= 0"),
    })
        .superRefine((val, ctx) => {
        if (val.answer >= val.options.length) {
            ctx.addIssue({
                code: "custom",
                message: "Index jawaban harus kurang dari jumlah opsi",
            });
        }
    }))
        .min(1, "Minimal harus ada 1 pertanyaan"),
});
exports.submitAssessmentSchema = zod_1.z.object({
    answers: zod_1.z.array(zod_1.z.string().min(1)).min(1),
});
exports.assessmentParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: "Format UUID tidak valid" }),
});
