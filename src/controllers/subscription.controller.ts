import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { cloudinaryUpload } from "../utils/cloudinary";
import dayjs from "dayjs";
import crypto from "crypto";
import snap from "../lib/midtrans";
import {
  getAllSubscriptions,
  approveSubscriptionById,
} from "../services/subscription.service";
import { asyncHandler } from "../utils/asyncHandler";

// DEVELOPER

export const getSubscriptions = asyncHandler(async (req, res) => {
  const data = await getAllSubscriptions();
  return res.json(data);
});

export const approveSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await approveSubscriptionById(id);
  return res.json(result);
});

export const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  const [total, active, expired, standard, professional, paidSubs] =
    await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({
        where: {
          endDate: { gte: new Date() },
          isApproved: true,
          paymentStatus: "PAID",
        },
      }),
      prisma.subscription.count({
        where: {
          endDate: { lt: new Date() },
          isApproved: true,
          paymentStatus: "PAID",
        },
      }),
      prisma.subscription.count({
        where: {
          type: "STANDARD",
          isApproved: true,
          paymentStatus: "PAID",
        },
      }),
      prisma.subscription.count({
        where: {
          type: "PROFESSIONAL",
          isApproved: true,
          paymentStatus: "PAID",
        },
      }),
      prisma.subscription.findMany({
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
});

// USER

export const getSubscriptionOptions = asyncHandler(async (req, res) => {
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
});

export const subscribe = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { type, paymentMethod } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!type || !["STANDARD", "PROFESSIONAL"].includes(type)) {
    return res.status(400).json({ message: "Invalid subscription type" });
  }

  if (!paymentMethod) {
    return res.status(400).json({ message: "Payment method is required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Payment proof is required" });
  }

  const uploadResult = await cloudinaryUpload(req.file);
  const paymentProofUrl = uploadResult.secure_url;
  const amount = type === "STANDARD" ? 25000 : 100000;

  const existing = await prisma.subscription.findFirst({
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

  const subscription = await prisma.subscription.create({
    data: {
      type,
      paymentMethod,
      paymentProof: paymentProofUrl,
      amount,
      paymentStatus: "PENDING",
      isApproved: false,
      userId,
      startDate: new Date(),
      endDate: dayjs().add(30, "day").toDate(),
    },
  });

  return res.status(201).json(subscription);
});

export const getMySubscription = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { endDate: "desc" },
  });

  if (!sub) return res.json({ status: "INACTIVE" });

  const isActive =
    sub.isApproved && sub.paymentStatus === "PAID" && sub.endDate >= new Date();

  return res.json({
    status: isActive ? "ACTIVE" : "INACTIVE",
    expiredAt: sub.endDate,
  });
});

export const getSubscriptionHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const history = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });

  return res.json(history);
});

export const createMidtransTransaction = asyncHandler(async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!type || !["STANDARD", "PROFESSIONAL"].includes(type)) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }

    const price = type === "PROFESSIONAL" ? 100000 : 25000;

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        type,
        amount: price,
        startDate: new Date(),
        endDate: dayjs().add(30, "day").toDate(),
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
        first_name: req.user?.name || "User",
        email: req.user?.email || "example@mail.com",
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (err) {
    console.error("Midtrans error", err);
    res.status(500).json({ message: "Failed to create Midtrans transaction" });
  }
});

export const midtransWebhookHandler = asyncHandler(async (req, res) => {
  const {
    order_id,
    transaction_status,
    fraud_status,
    signature_key,
    gross_amount,
    status_code,
  } = req.body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(order_id + status_code + gross_amount + serverKey)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return res.status(403).json({ message: "Invalid signature" });
  }

  const matched = await prisma.subscription.findFirst({
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
    await prisma.subscription.update({
      where: { id: matched.id },
      data: {
        paymentStatus: "PAID",
        isApproved: true,
      },
    });
  } else if (["expire", "cancel"].includes(transaction_status)) {
    await prisma.subscription.update({
      where: { id: matched.id },
      data: {
        paymentStatus: "EXPIRED",
      },
    });
  }

  return res.status(200).json({ message: "Webhook handled" });
});

export const rejectSubscriptionHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subscription = await prisma.subscription.update({
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
});
