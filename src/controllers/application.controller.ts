import { Request, Response, NextFunction } from "express";
import {
  getApplicantsByJob,
  getApplicationDetail,
  updateApplicationStatus,
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
