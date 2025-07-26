import { z } from "zod";

export const createPreSelectionTestSchema = z.object({
  jobId: z.string().uuid(),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
      })
    )
    .length(25),
});

export type CreatePreSelectionTestInput = z.infer<
  typeof createPreSelectionTestSchema
>;

export const updatePreSelectionTestSchema = z.object({
  questions: z
    .array(
      z.object({
        index: z.number().int().min(0).max(24),
        question: z.string().min(1),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
      })
    )
    .min(1),
});

export type UpdatePreSelectionTestInput = z.infer<
  typeof updatePreSelectionTestSchema
>;

export const submitPreSelectionAnswerSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)).length(25),
});

export type SubmitPreSelectionAnswerInput = z.infer<
  typeof submitPreSelectionAnswerSchema
>;
