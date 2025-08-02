import { Request, Response, NextFunction } from "express";
import { cloudinaryUpload } from "../utils/cloudinary";
import {
  createJob,
  getJobsByAdmin,
  getJobDetailById,
  updateJobById,
  deleteJobById,
  updateJobStatus,
  getJobsWithFilters,
  getSavedJobsByUser,
  isJobSavedByUser,
  saveJobService,
  removeSavedJob,
  getJobFiltersMetaService,
  GetSuggestedJobService,
  applyJobService,
  getJobDetailsService,
  getSavedJobsByUserPaginated,
  getNearbyJobsService,
} from "../services/job.service";
import type { JobFilters } from "../interfaces/jobs.interface";
import { createJobSchema, applyJobSchema } from "../schema/job.schema";
import { JobStatus } from "@prisma/client";

export async function createJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;

    const raw = {
      ...req.body,
      salary: req.body.salary ? Number(req.body.salary) : undefined,
      isRemote: req.body.isRemote === "true",
      hasTest: req.body.hasTest === "true",
      tags: req.body.tags
        ? Array.isArray(req.body.tags)
          ? req.body.tags
          : [req.body.tags]
        : [],
      latitude: req.body.latitude ? Number(req.body.latitude) : undefined,
      longitude: req.body.longitude ? Number(req.body.longitude) : undefined,
    };

    const parsed = createJobSchema.parse(raw);

    let bannerUrl = undefined;
    if (req.file) {
      const upload = await cloudinaryUpload(req.file, "image");
      bannerUrl = `${upload.public_id}.${upload.format}`;
    }

    const job = await createJob(adminId, {
      ...parsed,
      bannerUrl,
    });

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
    const rawId = req.params.id;
    const jobId = rawId.slice(0, 36);
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

    let raw =
      typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body;

    const parsed = {
      ...raw,
      salary: raw.salary ? Number(raw.salary) : undefined,
      isRemote: raw.isRemote === "true" || raw.isRemote === true,
      hasTest: raw.hasTest === "true" || raw.hasTest === true,
      tags: Array.isArray(raw.tags) ? raw.tags : raw.tags ? [raw.tags] : [],
      latitude: raw.latitude ? Number(raw.latitude) : undefined,
      longitude: raw.longitude ? Number(raw.longitude) : undefined,
    };

    let bannerUrl: string | undefined;
    if (req.file) {
      const uploaded = await cloudinaryUpload(req.file, "image");
      bannerUrl = `${uploaded.public_id}.${uploaded.format}`;
    }

    const updated = await updateJobById(jobId, adminId, {
      ...parsed,
      ...(bannerUrl && { bannerUrl }),
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updated,
    });
    return;
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

export async function getJobsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters: JobFilters = (req as any).validatedQuery;

    const data = await getJobsWithFilters(filters);

    res.status(200).json({
      success: true,
      total: data.total,
      jobs: data.jobs,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSavedJobsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const savedJobs = await getSavedJobsByUser(userId);
    res.status(200).json(savedJobs);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function checkIsJobSavedHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    const jobId = req.params.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    if (!jobId) {
      throw new Error("Job ID is required");
    }

    const isSaved = await isJobSavedByUser(userId, jobId);

    res.status(200).json({ isSaved });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function saveJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    const jobId = req.params.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }
    if (!jobId) throw new Error("Job ID is required");

    await saveJobService(userId, jobId);

    res.json({ success: true, message: "Job saved successfully" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function removeSavedJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.id;
    const jobId = req.params.id;

    if (!jobId) {
      throw new Error("Job ID is required.");
    }

    await removeSavedJob(userId, jobId);

    res.json({ success: true, message: "Job removed from saved list." });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getJobFiltersMetaHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const meta = await getJobFiltersMetaService();
    res.status(200).json({ success: true, data: meta });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function GetSuggestedJobsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { companyId } = req.params;
    const excludeJobId = req.query.excludeJobId as string | undefined;

    if (!companyId) {
      throw new Error("Company ID is required");
    }

    const jobs = await GetSuggestedJobService(companyId, excludeJobId);
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function applyJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobId = req.params.id;
    const userId = req.user!.id;

    const { expectedSalary, coverLetter } = req.body;

    const parsed = applyJobSchema.safeParse({
      expectedSalary: Number(expectedSalary),
      cvFile: "placeholder",
      coverLetter,
    });

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "Resume (CV) file is required" });
      return;
    }

    const result = await cloudinaryUpload(file, "raw");
    const cvFileUrl = result.secure_url;

    const application = await applyJobService(jobId, userId, {
      expectedSalary: parsed.data.expectedSalary,
      coverLetter,
      cvFile: cvFileUrl,
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}

export async function getJobDetailViewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobId = req.params.id;

    const job = await getJobDetailsService(jobId);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
    }

    const now = new Date();
    const isExpired = job?.deadline ? new Date(job.deadline) < now : false;
    const isClosed =
      job?.status === JobStatus.CLOSED ||
      job?.status === JobStatus.DRAFT ||
      job?.status === JobStatus.ARCHIVED;

    res.status(200).json({
      ...job,
      isExpired,
      isClosed,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSavedJobsPaginatedController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { page, pageSize } = (req as any).validatedQuery;

    const result = await getSavedJobsByUserPaginated(userId, page, pageSize);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getNearbyJobsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { lat, lng, radiusKm = 100, page = 1, pageSize = 10 } = req.query;

    const numericRadiusKm =
      radiusKm !== undefined && !isNaN(Number(radiusKm))
        ? Number(radiusKm)
        : 100;

    const numericLat = Number(lat);
    const numericLng = Number(lng);
    const numericPage = Number(page);
    const numericPageSize = Number(pageSize);

    const jobs = await getNearbyJobsService(
      numericLat,
      numericLng,
      numericRadiusKm,
      numericPage,
      numericPageSize
    );

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
}
