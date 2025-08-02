import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

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

export const ApplicationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ApplicationStatus).optional(),
});

export type ApplicationQuery = z.infer<typeof ApplicationQuerySchema>;

export const feedbackSchema = z.object({
  feedback: z.string().min(1, "Feedback must not be empty"),
});
