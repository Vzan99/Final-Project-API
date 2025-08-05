"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectSubscriptionHandler = exports.midtransWebhookHandler = exports.createMidtransTransaction = exports.getSubscriptionHistory = exports.getMySubscription = exports.subscribe = exports.getSubscriptionOptions = exports.getSubscriptionAnalytics = exports.approveSubscription = exports.getSubscriptions = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const cloudinary_1 = require("../utils/cloudinary");
const dayjs_1 = __importDefault(require("dayjs"));
const crypto_1 = __importDefault(require("crypto"));
const midtrans_1 = __importDefault(require("../lib/midtrans"));
const subscription_service_1 = require("../services/subscription.service");
const asyncHandler_1 = require("../utils/asyncHandler");
// DEVELOPER
exports.getSubscriptions = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, subscription_service_1.getAllSubscriptions)();
    return res.json(data);
}));
exports.approveSubscription = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield (0, subscription_service_1.approveSubscriptionById)(id);
    return res.json(result);
}));
exports.getSubscriptionAnalytics = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [total, active, expired, standard, professional, paidSubs] = yield Promise.all([
        prisma_1.default.subscription.count(),
        prisma_1.default.subscription.count({
            where: {
                endDate: { gte: new Date() },
                isApproved: true,
                paymentStatus: "PAID",
            },
        }),
        prisma_1.default.subscription.count({
            where: {
                endDate: { lt: new Date() },
                isApproved: true,
                paymentStatus: "PAID",
            },
        }),
        prisma_1.default.subscription.count({
            where: {
                type: "STANDARD",
                isApproved: true,
                paymentStatus: "PAID",
            },
        }),
        prisma_1.default.subscription.count({
            where: {
                type: "PROFESSIONAL",
                isApproved: true,
                paymentStatus: "PAID",
            },
        }),
        prisma_1.default.subscription.findMany({
            where: {
                isApproved: true,
                paymentStatus: "PAID",
            },
            select: { amount: true },
        }),
    ]);
    const revenue = paidSubs.reduce((sum, s) => sum + s.amount, 0);
    return res.json({
        total,
        active,
        expired,
        standard,
        professional,
        revenue,
    });
}));
// USER
exports.getSubscriptionOptions = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = [
        {
            type: "STANDARD",
            price: 25000,
            features: ["CV Generator", "Skill Assessment x2"],
        },
        {
            type: "PROFESSIONAL",
            price: 100000,
            features: [
                "CV Generator",
                "Unlimited Skill Assessment",
                "Priority Review",
            ],
        },
    ];
    return res.json(options);
}));
exports.subscribe = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { type, paymentMethod } = req.body;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    if (!type || !["STANDARD", "PROFESSIONAL"].includes(type)) {
        return res.status(400).json({ message: "Invalid subscription type" });
    }
    if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method is required" });
    }
    if (!req.file) {
        return res.status(400).json({ message: "Payment proof is required" });
    }
    const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(req.file);
    const paymentProofUrl = uploadResult.secure_url;
    const amount = type === "STANDARD" ? 25000 : 100000;
    const existing = yield prisma_1.default.subscription.findFirst({
        where: {
            userId,
            endDate: { gte: new Date() },
            isApproved: true,
        },
    });
    if (existing) {
        return res
            .status(400)
            .json({ message: "You already have an active subscription." });
    }
    const subscription = yield prisma_1.default.subscription.create({
        data: {
            type,
            paymentMethod,
            paymentProof: paymentProofUrl,
            amount,
            paymentStatus: "PENDING",
            isApproved: false,
            userId,
            startDate: new Date(),
            endDate: (0, dayjs_1.default)().add(30, "day").toDate(),
        },
    });
    return res.status(201).json(subscription);
}));
exports.getMySubscription = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const sub = yield prisma_1.default.subscription.findFirst({
        where: { userId },
        orderBy: { endDate: "desc" },
    });
    if (!sub)
        return res.json({ status: "INACTIVE" });
    const isActive = sub.isApproved && sub.paymentStatus === "PAID" && sub.endDate >= new Date();
    return res.json({
        status: isActive ? "ACTIVE" : "INACTIVE",
        expiredAt: sub.endDate,
    });
}));
exports.getSubscriptionHistory = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const history = yield prisma_1.default.subscription.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
    });
    return res.json(history);
}));
exports.createMidtransTransaction = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { type } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!type || !["STANDARD", "PROFESSIONAL"].includes(type)) {
            return res.status(400).json({ message: "Invalid subscription type" });
        }
        const price = type === "PROFESSIONAL" ? 100000 : 25000;
        const subscription = yield prisma_1.default.subscription.create({
            data: {
                userId,
                type,
                amount: price,
                startDate: new Date(),
                endDate: (0, dayjs_1.default)().add(30, "day").toDate(),
                paymentStatus: "PENDING",
                isApproved: false,
            },
        });
        const orderId = `ORD-${userId.slice(0, 6)}-${subscription.id.slice(0, 6)}`;
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: price,
            },
            credit_card: {
                secure: true,
            },
            customer_details: {
                first_name: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name) || "User",
                email: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.email) || "example@mail.com",
            },
        };
        const transaction = yield midtrans_1.default.createTransaction(parameter);
        res.json({ token: transaction.token });
    }
    catch (err) {
        console.error("Midtrans error", err);
        res.status(500).json({ message: "Failed to create Midtrans transaction" });
    }
}));
exports.midtransWebhookHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { order_id, transaction_status, fraud_status, signature_key, gross_amount, status_code, } = req.body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const expectedSignature = crypto_1.default
        .createHash("sha512")
        .update(order_id + status_code + gross_amount + serverKey)
        .digest("hex");
    if (signature_key !== expectedSignature) {
        return res.status(403).json({ message: "Invalid signature" });
    }
    const matched = yield prisma_1.default.subscription.findFirst({
        where: {
            paymentStatus: "PENDING",
            isApproved: false,
            amount: Number(gross_amount),
        },
        orderBy: {
            startDate: "desc",
        },
    });
    if (!matched) {
        return res.status(404).json({ message: "Matching subscription not found" });
    }
    if (["settlement", "capture"].includes(transaction_status)) {
        yield prisma_1.default.subscription.update({
            where: { id: matched.id },
            data: {
                paymentStatus: "PAID",
                isApproved: true,
            },
        });
    }
    else if (["expire", "cancel"].includes(transaction_status)) {
        yield prisma_1.default.subscription.update({
            where: { id: matched.id },
            data: {
                paymentStatus: "EXPIRED",
            },
        });
    }
    return res.status(200).json({ message: "Webhook handled" });
}));
exports.rejectSubscriptionHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const subscription = yield prisma_1.default.subscription.update({
        where: { id },
        data: {
            isApproved: false,
            paymentStatus: "PENDING",
        },
    });
    res.status(200).json({
        message: "Subscription rejected",
        data: subscription,
    });
}));
