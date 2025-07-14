import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { IUserReqParam } from "../types/express";
import prisma from "../lib/prisma";
import { SubscriptionType } from "@prisma/client";
import { Role } from "@prisma/client";

// Token verification
export async function VerifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.header("Authorization");
    const cookieToken = req.cookies?.access_token;

    const token =
      (authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1]) ||
      cookieToken;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    const verifyUser = verify(token, String(SECRET_KEY));
    req.user = verifyUser as IUserReqParam;

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

// Role guards
export const UserGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== Role.USER) {
    res.status(403).json({ message: "Access restricted: User only" });
    return;
  }
  next();
};

export const AdminGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== Role.ADMIN) {
    res.status(403).json({ message: "Access restricted: Admin only" });
    return;
  }
  next();
};

export const DeveloperGuard = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== Role.DEVELOPER) {
    res.status(403).json({ message: "Access restricted: Developer only" });
    return;
  }
  next();
};

// Subscription access check (STANDARD or PROFESSIONAL)
export const SubscriberGuard = async (
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
    res
      .status(403)
      .json({ message: "Subscription required to access this feature" });
    return;
  }

  (req as any).subscription = sub;
  next();
};

// Only for PROFESSIONAL
export const ProfessionalOnly = async (
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
      type: SubscriptionType.PROFESSIONAL,
    },
  });

  if (!sub) {
    res.status(403).json({ message: "Professional subscription required" });
    return;
  }

  next();
};
