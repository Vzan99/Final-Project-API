import { z } from "zod";

export const createInterviewSchema = z.object({
  jobId: z.string().uuid(),
  userId: z.string().uuid(),
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;

export const updateInterviewSchema = z.object({
  dateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"])
    .optional(),
});

export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;

export const updateInterviewStatusSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED", "RESCHEDULED"]),
});
