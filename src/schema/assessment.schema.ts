import { z } from "zod";

export const createAssessmentSchema = z.object({
  name: z.string().trim().min(3, "Nama assessment minimal 3 karakter"),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  timeLimit: z.number().min(1).optional(),
  questions: z
    .array(
      z
        .object({
          question: z.string().trim().min(1, "Pertanyaan tidak boleh kosong"),
          options: z
            .array(z.string().trim().min(1, "Opsi tidak boleh kosong"))
            .min(2, "Minimal harus ada 2 opsi")
            .max(6, "Maksimal 6 opsi"),
          answer: z.number().min(0, "Jawaban harus berupa indeks >= 0"),
        })
        .superRefine((val, ctx) => {
          if (val.answer >= val.options.length) {
            ctx.addIssue({
              code: "custom",
              message: "Index jawaban harus kurang dari jumlah opsi",
            });
          }
        })
    )
    .min(1, "Minimal harus ada 1 pertanyaan"),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(z.string().min(1)).min(1),
});

export const assessmentParamSchema = z.object({
  id: z.string().uuid({ message: "Format UUID tidak valid" }),
});
