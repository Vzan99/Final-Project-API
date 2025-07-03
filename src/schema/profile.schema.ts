import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  birthDate: z.string(),
  gender: z.string(),
  education: z.string(),
  address: z.string(),
  skills: z.union([z.string(), z.array(z.string())]),
  about: z.string().optional(),
});
