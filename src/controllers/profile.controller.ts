import { Request, Response, NextFunction } from "express";
import {
  GetProfileService,
  ChangePasswordService,
  ChangeEmailService,
  UpdateUserProfileService,
  UpdateProfilePhotoService,
  UpdateResumeService,
  UpdateBannerService,
  UpdateExperiencesService,
  UpdateCompanyProfileService,
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

async function UpdateProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw new Error("Unauthorized");

    const input = {
      userId: req.user.id,
      ...req.body,
    };

    const updatedProfile = await UpdateUserProfileService(input);

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

async function UpdateProfilePhotoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId || !file)
      throw new Error("User ID and photo file are required");

    const result = await UpdateProfilePhotoService(userId, file);

    res.status(200).json({
      message: result.message,
      filename: result.filename,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

async function UpdateResumeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId || !file)
      throw new Error("User ID and resume file are required");

    const result = await UpdateResumeService(userId, file);

    res.status(200).json({
      message: result.message,
      filename: result.filename,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

async function UpdateBannerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const file = req.file;

    if (!userId || !role || !file)
      throw new Error("User ID, role, and banner file are required");

    const result = await UpdateBannerService(userId, role, file);

    res.status(200).json({
      message: result.message,
      filename: result.filename,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

async function UpdateExperiencesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { experiences } = req.body;

    const updated = await UpdateExperiencesService(userId, experiences);

    res.status(200).json({
      message: "Experiences updated successfully",
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

async function UpdateCompanyProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const company = await UpdateCompanyProfileService(userId, req.body);

    res.status(200).json({
      message: "Company profile updated successfully",
      data: company,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export {
  GetProfileController,
  ChangePasswordController,
  ChangeEmailController,
  UpdateProfileController,
  UpdateProfilePhotoController,
  UpdateResumeController,
  UpdateBannerController,
  UpdateExperiencesController,
  UpdateCompanyProfileController,
};
