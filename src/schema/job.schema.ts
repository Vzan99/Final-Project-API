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

export const jobFiltersSchema = z.object({
  title: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  isRemote: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  salaryMin: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "salaryMin must be a number",
    })
    .transform((val) => (val ? Number(val) : undefined)),
  salaryMax: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "salaryMax must be a number",
    })
    .transform((val) => (val ? Number(val) : undefined)),
  experienceLevel: z.string().optional(),
  page: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))),
      {
        message: "page must be a positive integer",
      }
    )
    .transform((val) => (val ? Number(val) : 1)),
  pageSize: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))),
      {
        message: "pageSize must be a positive integer",
      }
    )
    .transform((val) => (val ? Number(val) : 10)),
  sortBy: z.enum(["createdAt", "salary", "relevance"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  lat: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "lat must be a number",
    })
    .transform((val) => (val ? Number(val) : undefined)),
  lng: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "lng must be a number",
    })
    .transform((val) => (val ? Number(val) : undefined)),

  listingTime: z
    .enum(["any", "today", "3days", "7days", "14days", "30days", "custom"])
    .optional()
    .default("any"),

  customStartDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "customStartDate must be a valid date string",
    }),

  customEndDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "customEndDate must be a valid date string",
    }),
});

export const applyJobSchema = z.object({
  expectedSalary: z
    .number({ required_error: "Expected salary is required" })
    .min(1, "Expected salary must be greater than 0"),
  coverLetter: z.string().optional(),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema> & {
  cvFile: string;
};

export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))),
      {
        message: "page must be a positive integer",
      }
    )
    .transform((val) => (val ? Number(val) : 1)),
  pageSize: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))),
      {
        message: "pageSize must be a positive integer",
      }
    )
    .transform((val) => (val ? Number(val) : 10)),
});
