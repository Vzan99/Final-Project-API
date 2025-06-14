import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { IUserReqParam } from "../types/express";

async function VerifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("Unauthorized");

    const verifyUser = verify(token, String(SECRET_KEY));

    if (!verifyUser) throw new Error("Invalid Token");

    req.user = verifyUser as IUserReqParam;

    next();
  } catch (err) {
    next(err);
  }
}

async function AdminGuard(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.role !== "ADMIN") throw new Error("Restricted");
    next();
  } catch (err) {
    next(err);
  }
}

// async function UserGuard
// async function DeveloperGuard
// async function VerifyBadge
// async function VerifiedCheck

export { VerifyToken, AdminGuard };
