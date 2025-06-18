import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { cloudinaryUpload } from "../utils/cloudinary";
import dayjs from "dayjs";
import {
  getAllSubscriptions,
  approveSubscriptionById,
} from "../services/subscription.service";

// ADMIN

export const getSubscriptions = async (req: Request, res: Response) => {
  const data = await getAllSubscriptions();
  return res.json(data);
};

export const approveSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await approveSubscriptionById(id);
  return res.json(result);
};

// USER

export const getSubscriptionOptions = async (req: Request, res: Response) => {
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
};

export const subscribe = async (req: Request, res: Response) => {
  const { type, paymentMethod } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
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
};

export const getMySubscription = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { endDate: "desc" },
  });

  if (!sub) {
    return res.status(404).json({ message: "You have no subscriptions." });
  }

  return res.json(sub);
};

export const getSubscriptionAnalytics = async (req: Request, res: Response) => {
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
        where: { type: "STANDARD", isApproved: true, paymentStatus: "PAID" },
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
};

export const getSubscriptionHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const history = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });

  return res.json(history);
};
