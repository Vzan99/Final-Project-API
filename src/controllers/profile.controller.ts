import { Request, Response, NextFunction } from "express";
import {
  GetProfileService,
  ChangePasswordService,
  ChangeEmailService,
} from "../services/profile.service";

async function GetProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw new Error("Unauthorized");

    const profile = await GetProfileService(req.user.id);

    res.status(200).json({
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

async function ChangePasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id;
  if (!userId) return next(new Error("Unauthorized"));

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return next(new Error("Current and new password are required"));

  try {
    const result = await ChangePasswordService(
      userId,
      currentPassword,
      newPassword
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function ChangeEmailController(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { newEmail, password } = req.body;
  if (!userId) throw new Error("Unauthorized");
  if (!newEmail || !password)
    throw new Error("New email and password is Required");

  try {
    const result = await ChangeEmailService(userId, newEmail, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export {
  GetProfileController,
  ChangePasswordController,
  ChangeEmailController,
};
