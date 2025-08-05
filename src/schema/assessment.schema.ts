import { z } from "zod";

export const createAssessmentSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100),
  timeLimit: z.number().min(1),
  questions: z
    .array(
      z.object({
        question: z.string().min(5),
        options: z
          .array(z.string().min(1))
          .min(2, "Minimal 2 opsi")
          .max(6, "Maksimal 6 opsi"),
        answer: z.number().min(0, "Answer must be valid"),
      })
    )
    .min(25, "Jumlah soal harus 25")
    .min(1)
    .superRefine((qs, ctx) => {
      qs.forEach((q, i) => {
        if (q.answer >= q.options.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Index jawaban di luar batas opsi",
            path: [i, "answer"],
          });
        }
      });
    }),
});

export const updateAssessmentSchema = createAssessmentSchema.partial();

export const submitAssessmentSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        selectedAnswer: z.string(),
      })
    )
    .min(1),
});

export const assessmentParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid assessment ID format" }),
});
