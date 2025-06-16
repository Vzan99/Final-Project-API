import { z } from "zod";

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["REVIEWED", "INTERVIEW", "ACCEPTED", "REJECTED"]),
});

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;
