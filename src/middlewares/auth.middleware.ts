import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { IUserReqParam } from "../types/express";

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

export const UserGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "USER") {
    res.status(403).json({ message: "Access restricted: User only" });
    return;
  }
  next();
};

export const AdminGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
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
  if (req.user?.role !== "DEVELOPER") {
    res.status(403).json({ message: "Access restricted: Developer only" });
    return;
  }
  next();
};
