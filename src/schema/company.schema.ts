import { z } from "zod";

export const companyFilterSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.enum(["name", "location"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z
    .string()
    .transform(Number)
    .refine((n) => n > 0, { message: "Page must be greater than 0" })
    .optional()
    .default("1"),
  pageSize: z
    .string()
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, {
      message: "Page size must be between 1 and 100",
    })
    .optional()
    .default("10"),
});
