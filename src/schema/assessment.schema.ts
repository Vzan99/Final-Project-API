import { z } from "zod";

// ───── Developer creates new assessment
export const createAssessmentSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  timeLimit: z.number().min(1).optional(),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2).max(6),
        answer: z.number().min(0),
      })
    )
    .min(1),
});

// ───── User submits assessment answers
export const submitAssessmentSchema = z.object({
  body: z.object({
    answers: z.array(z.string().min(1)).min(1),
  }),
});

// ───── Param validation
export const assessmentParamSchema = z.object({
  id: z.string().uuid("Invalid assessment ID"),
});
