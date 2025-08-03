import { z } from "zod";

export const createSubscriptionSchema = z.object({
  body: z.object({
    type: z.enum(["STANDARD", "PROFESSIONAL"]),
    paymentMethod: z.string().min(3),
  }),
});

export const midtransTokenSchema = z.object({
  type: z.enum(["STANDARD", "PROFESSIONAL"]),
});

export const subscriptionIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid subscription ID"),
  }),
});

export const midtransWebhookSchema = z.object({
  body: z.object({
    order_id: z.string().min(1),
    transaction_status: z.string().min(1),
    fraud_status: z.string().optional(),
    signature_key: z.string().min(1),
    gross_amount: z.string().regex(/^\d+$/),
    status_code: z.string().regex(/^\d+$/),
  }),
});
