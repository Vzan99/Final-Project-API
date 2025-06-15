import { Request, Response, NextFunction } from "express";
import { GetProfileService } from "../services/profile.service";

export async function GetProfileController(
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
