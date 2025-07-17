import { z } from "zod";

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["REVIEWED", "INTERVIEW", "ACCEPTED", "REJECTED"]),
});

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;

export const ApplyJobSchema = z.object({
  expectedSalary: z.number().min(1),
  cvFile: z.string().url(),
  coverLetter: z.string().optional(),
});

export type ApplyJobInput = z.infer<typeof ApplyJobSchema>;
