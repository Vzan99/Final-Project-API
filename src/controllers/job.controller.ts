import { Request, Response, NextFunction } from "express";
import {
  createJob,
  getJobsByAdmin,
  getJobDetailById,
  updateJobById,
  deleteJobById,
  updateJobStatus,
} from "../services/job.service";

export async function createJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const data = req.body;

    const job = await createJob(adminId, data);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobsByAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;

    const {
      title,
      categoryId,
      status,
      sort = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string) || 1);
    const limitNumber = Math.max(1, parseInt(limit as string) || 10);

    const query: {
      title?: string;
      categoryId?: string;
      status?: string;
      sort?: "asc" | "desc";
      page: number;
      limit: number;
    } = {
      title: typeof title === "string" ? title : undefined,
      categoryId: typeof categoryId === "string" ? categoryId : undefined,
      status: typeof status === "string" ? status : undefined,
      sort: sort === "asc" || sort === "desc" ? sort : undefined,
      page: pageNumber,
      limit: limitNumber,
    };

    const result = await getJobsByAdmin(adminId, query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.params.id;
    const adminId = req.user!.id;

    const job = await getJobDetailById(jobId, adminId);

    res.json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.params.id;
    const adminId = req.user!.id;
    const data = req.body;

    const updated = await updateJobById(jobId, adminId, data);

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.params.id;
    const adminId = req.user!.id;

    const result = await deleteJobById(jobId, adminId);

    res.json({
      success: true,
      message: "Job deleted successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJobStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.params.id;
    const adminId = req.user!.id;
    const data = req.body;

    const updated = await updateJobStatus(jobId, adminId, data);

    res.json({
      success: true,
      message: "Job status updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
