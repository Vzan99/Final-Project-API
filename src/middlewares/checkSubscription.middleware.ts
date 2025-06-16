import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export const checkActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;

  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      isApproved: true,
      paymentStatus: "PAID",
      endDate: { gte: new Date() },
    },
  });

  if (!sub) {
    res.status(403).json({
      message: "Subscription required to access this feature.",
    });
    return;
  }

  next();
};
