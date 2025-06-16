import {
  getAllSubscriptions,
  approveSubscriptionById,
} from "../services/subscription.service";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import dayjs from "dayjs";
import { cloudinaryUpload } from "../utils/cloudinary";

export const getSubscriptions = async (req: Request, res: Response) => {
  const data = await getAllSubscriptions();
  res.json(data);
};

export const approveSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await approveSubscriptionById(id);
  res.json(result);
};

export const getSubscriptionOptions = (req: Request, res: Response) => {
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
  res.json(options);
};

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { type, paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Payment proof is required" });
      return;
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
      res
        .status(400)
        .json({ message: "You already have an active subscription." });
      return;
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

    res.status(201).json(subscription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
