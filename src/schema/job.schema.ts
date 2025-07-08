import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  salary: z.number().int().positive().optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  isRemote: z.boolean().default(false),
  experienceLevel: z.enum(["Entry", "Mid", "Senior"]),
  jobType: z.enum(["Full-time", "Part-time", "Contract"]),
  tags: z.array(z.string()).optional(),
  bannerUrl: z.string().optional(),
  category: z.string(),
  hasTest: z.boolean().optional().default(false),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  salary: z
    .union([z.number().int().positive(), z.string().length(0)])
    .transform((val) => (typeof val === "string" ? undefined : val))
    .optional(),
  deadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
  isRemote: z.boolean().optional(),
  experienceLevel: z.enum(["Entry", "Mid", "Senior"]).optional(),
  jobType: z.enum(["Full-time", "Part-time", "Contract"]).optional(),
  tags: z.array(z.string()).optional().default([]),
  bannerUrl: z.string().optional(),
  category: z.string().optional(),
  hasTest: z.boolean().optional().default(false),
});

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const publishJobSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]),
});

export type PublishJobInput = z.infer<typeof publishJobSchema>;
