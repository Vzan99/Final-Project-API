import { z } from "zod";

export const createReviewSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  position: z.string().min(2),
  salaryEstimate: z.number().min(0),
  content: z.string().min(10),
  rating: z.number().min(1).max(5),
  cultureRating: z.number().min(1).max(5),
  workLifeRating: z.number().min(1).max(5),
  careerRating: z.number().min(1).max(5),
  isAnonymous: z.boolean(),
});

export const reviewQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .refine((n) => !isNaN(n) && n > 0, { message: "Invalid page number" })
    .optional(),
  pageSize: z
    .string()
    .transform(Number)
    .refine((n) => !isNaN(n) && n > 0, { message: "Invalid page size" })
    .optional(),
});
