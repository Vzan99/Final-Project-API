import { Request, Response, NextFunction } from "express";
import {
  getApplicantsByJob,
  getApplicationDetail,
  updateApplicationStatus,
  applyToJobService,
} from "../services/application.service";

export async function getApplicantsByJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const jobId = req.params.jobId;

    const applicants = await getApplicantsByJob(jobId, adminId);

    res.status(200).json({
      success: true,
      data: applicants,
    });
  } catch (err) {
    next(err);
  }
}

export async function getApplicationDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const applicationId = req.params.id;
    const adminId = req.user!.id;

    const detail = await getApplicationDetail(applicationId, adminId);

    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const applicationId = req.params.id;
    const data = req.body;

    const updated = await updateApplicationStatus(applicationId, adminId, data);

    res.status(200).json({
      success: true,
      message: "Application status updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function applyToJobController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    if (!user || user.role !== "USER" || !user.isVerified) {
      throw new Error("Unauthorized access");
    }

    const jobId = req.params.jobId;
    const input = (req as any).validatedBody;

    const application = await applyToJobService(user.id, jobId, input);

    res.status(201).json({ success: true, application });
  } catch (err) {
    next(err);
  }
}
