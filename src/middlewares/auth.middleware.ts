import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { IUserReqParam } from "../types/express";

async function VerifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Check both the Authorization header and cookie
    const authHeader = req.header("Authorization");
    const cookieToken = req.cookies?.access_token;

    // Extract token from header or cookie
    const token =
      (authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1]) ||
      cookieToken;

    if (!token) throw new Error("Unauthorized: Token missing");

    const verifyUser = verify(token, String(SECRET_KEY));
    if (!verifyUser) throw new Error("Invalid token");

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

const developerGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "DEVELOPER") {
    return res
      .status(403)
      .json({ message: "Access restricted: Developer only" });
  }
  next();
};

// async function UserGuard
// async function DeveloperGuard
// async function VerifyBadge
// async function VerifiedCheck

export { VerifyToken, AdminGuard, developerGuard };
