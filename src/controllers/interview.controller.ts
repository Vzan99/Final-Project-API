import { Request, Response, NextFunction } from "express";
import {
  createInterview,
  getAllInterviewsByAdmin,
  getInterviewsByJob,
  updateInterviewById,
  deleteInterviewById,
  updateInterviewStatus,
} from "../services/interview.service";
import { InterviewStatus } from "@prisma/client";

export async function createInterviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const data = req.body;
    const result = await createInterview(adminId, data);

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllInterviewsByAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;

    // Kirimkan query ke service
    const interviews = await getAllInterviewsByAdmin(adminId, req.query);

    res.json({ success: true, ...interviews });
  } catch (err) {
    next(err);
  }
}

export async function getInterviewsByJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.query.jobId as string;
    const adminId = req.user!.id;

    if (!jobId) {
      res.status(400).json({ message: "jobId is required" });
      return;
    }

    const result = await getInterviewsByJob(jobId, adminId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateInterviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const interviewId = req.params.id;
    const data = req.body;

    const updated = await updateInterviewById(interviewId, adminId, data);

    res.status(200).json({
      success: true,
      message: "Interview updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteInterviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const interviewId = req.params.id;

    const result = await deleteInterviewById(interviewId, adminId);

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateInterviewStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const interviewId = req.params.id;
    const { status } = req.body;

    if (!["COMPLETED", "CANCELLED", "RESCHEDULED"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const result = await updateInterviewStatus(
      interviewId,
      adminId,
      status as InterviewStatus
    );

    res.status(200).json({
      success: true,
      message: "Interview status updated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
