"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.midtransWebhookSchema = exports.subscriptionIdParamSchema = exports.midtransTokenSchema = exports.createSubscriptionSchema = void 0;
const zod_1 = require("zod");
exports.createSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(["STANDARD", "PROFESSIONAL"]),
        paymentMethod: zod_1.z.string().min(3),
    }),
});
exports.midtransTokenSchema = zod_1.z.object({
    type: zod_1.z.enum(["STANDARD", "PROFESSIONAL"]),
});
exports.subscriptionIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid subscription ID"),
    }),
});
exports.midtransWebhookSchema = zod_1.z.object({
    body: zod_1.z.object({
        order_id: zod_1.z.string().min(1),
        transaction_status: zod_1.z.string().min(1),
        fraud_status: zod_1.z.string().optional(),
        signature_key: zod_1.z.string().min(1),
        gross_amount: zod_1.z.string().regex(/^\d+$/),
        status_code: zod_1.z.string().regex(/^\d+$/),
    }),
});
