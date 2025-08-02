import { Request, Response, NextFunction } from "express";
import {
  getApplicantsByJob,
  getApplicationDetail,
  updateApplicationStatus,
  checkIfUserApplied,
  getUserApplicationService,
  submitApplicationFeedback,
} from "../services/application.service";
import { ApplicationQuery } from "../schema/application.schema";

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

export async function checkApplicationStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const jobId = req.params.jobId;

    const hasApplied = await checkIfUserApplied(jobId, userId);

    res.status(200).json({ success: true, applied: hasApplied });
  } catch (err) {
    next(err);
  }
}

export async function getUserApplicationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const { page, pageSize, status } = (req as any)
      .validatedQuery as ApplicationQuery;

    const result = await getUserApplicationService(
      userId,
      page,
      pageSize,
      status
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function postFeedbackController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const applicationId = req.params.id;
    const { feedback } = req.body;

    if (typeof feedback !== "string" || feedback.trim() === "") {
      throw new Error("Feedback must be a non-empty string");
    }

    const result = await submitApplicationFeedback(applicationId, feedback);
    res
      .status(200)
      .json({ message: "Feedback submitted", application: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}
