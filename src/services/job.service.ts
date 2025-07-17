import prisma from "../lib/prisma";
import { JobStatus } from "@prisma/client";
import {
  CreateJobInput,
  UpdateJobInput,
  PublishJobInput,
} from "../schema/job.schema";
import {
  PaginatedJobs,
  JobFilters,
  JobWithRelations,
} from "../interfaces/jobs.interface";
import { EmploymentType, LocationType } from "@prisma/client";

export async function createJob(adminId: string, data: CreateJobInput) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found");

  // Pisahkan "category" dari data lainnya
  const { category, deadline, ...rest } = data;

  // Cek atau buat kategori berdasarkan nama
  let categoryRecord = await prisma.category.findUnique({
    where: { name: category },
  });

  if (!categoryRecord) {
    categoryRecord = await prisma.category.create({
      data: { name: category },
    });
  }

  // Buat job baru
  const job = await prisma.job.create({
    data: {
      ...rest,
      companyId: company.id,
      categoryId: categoryRecord.id,
      deadline: new Date(deadline),
    },
  });

  return job;
}

export async function getJobsByAdmin(
  adminId: string,
  query: {
    title?: string;
    categoryId?: string;
    status?: string;
    sort?: "asc" | "desc";
    page?: number;
    limit?: number;
  }
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found.");

  const {
    title,
    categoryId,
    status,
    sort = "desc",
    page = 1,
    limit = 10,
  } = query;

  const skip = (page - 1) * limit;

  const jobs = await prisma.job.findMany({
    where: {
      companyId: company.id,
      ...(title && { title: { contains: title, mode: "insensitive" } }),
      ...(categoryId && { categoryId }),
      ...(status &&
        Object.values(JobStatus).includes(status as JobStatus) && {
          status: status as JobStatus,
        }),
    },
    orderBy: { createdAt: sort },
    skip,
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      location: true,
      salary: true,
      deadline: true,
      experienceLevel: true,
      jobType: true,
      bannerUrl: true, // ✅ pastikan ini disertakan
      category: {
        select: { name: true },
      },
      _count: {
        select: { applications: true },
      },
    },
  });

  const total = await prisma.job.count({
    where: {
      companyId: company.id,
      ...(title && { title: { contains: title, mode: "insensitive" } }),
      ...(categoryId && { categoryId }),
      ...(status &&
        Object.values(JobStatus).includes(status as JobStatus) && {
          status: status as JobStatus,
        }),
    },
  });

  return {
    jobs,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}

export async function getJobDetailById(jobId: string, adminId: string) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      category: true,
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job || job.companyId !== company.id) {
    throw new Error("Job not found or access denied");
  }

  return job;
}

export async function updateJobById(
  jobId: string,
  adminId: string,
  data: UpdateJobInput
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job || job.companyId !== company.id) {
    throw new Error("Job not found or access denied");
  }

  const { category, deadline, bannerUrl, ...rest } = data;

  let categoryId: string | undefined = undefined;

  if (category) {
    const existing = await prisma.category.findUnique({
      where: { name: category },
    });

    const categoryRecord =
      existing ??
      (await prisma.category.create({
        data: { name: category },
      }));

    categoryId = categoryRecord.id;
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      ...rest,
      ...(categoryId && { categoryId }),
      ...(deadline && { deadline: new Date(deadline) }),
      ...(bannerUrl && { bannerUrl }), // ✅ update banner kalau ada
    },
  });

  return updated;
}

export async function deleteJobById(jobId: string, adminId: string) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job || job.companyId !== company.id) {
    throw new Error("Job not found or access denied");
  }

  await prisma.job.delete({
    where: { id: jobId },
  });

  return { id: jobId };
}

export async function updateJobStatus(
  jobId: string,
  adminId: string,
  data: PublishJobInput
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job || job.companyId !== company.id) {
    throw new Error("Job not found or access denied");
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: { status: data.status },
  });

  return updated;
}

export async function getJobsWithFilters(
  filters: JobFilters
): Promise<PaginatedJobs> {
  const {
    title,
    location,
    jobType,
    isRemote,
    salaryMin,
    salaryMax,
    experienceLevel,
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const skip = (page - 1) * pageSize;

  const andFilters: any[] = [];

  if (title) {
    andFilters.push({
      title: { contains: title, mode: "insensitive" },
    });
  }

  if (location) {
    andFilters.push({
      location: { contains: location, mode: "insensitive" },
    });
  }

  if (jobType) andFilters.push({ jobType });
  if (typeof isRemote === "boolean") andFilters.push({ isRemote });
  if (salaryMin !== undefined) andFilters.push({ salary: { gte: salaryMin } });
  if (salaryMax !== undefined) andFilters.push({ salary: { lte: salaryMax } });
  if (experienceLevel) {
    andFilters.push({
      experienceLevel: { contains: experienceLevel, mode: "insensitive" },
    });
  }

  const allowedSortBy = ["createdAt", "salary"];
  const allowedSortOrder = ["asc", "desc"];
  const sortField = allowedSortBy.includes(sortBy) ? sortBy : "createdAt";
  const sortDir = allowedSortOrder.includes(sortOrder) ? sortOrder : "desc";

  const where = {
    AND: [
      ...(andFilters.length > 0 ? andFilters : []),
      { status: "PUBLISHED" },
    ],
  };

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip,
      take: pageSize,
      include: {
        company: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        category: true,
      },
    }),
  ]);

  return { total, jobs };
}

export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getSavedJobsByUser(
  userId: string
): Promise<JobWithRelations[]> {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: {
        include: {
          company: {
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return savedJobs.map((saved) => saved.job);
}

export async function isJobSavedByUser(
  userId: string,
  jobId: string
): Promise<boolean> {
  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  return savedJob !== null;
}

export async function saveJobService(userId: string, jobId: string) {
  const jobExists = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!jobExists) {
    throw new Error("Job not found");
  }

  const alreadySaved = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  if (alreadySaved) {
    throw new Error("Job already saved");
  }

  return prisma.savedJob.create({
    data: {
      userId,
      jobId,
    },
  });
}

export async function removeSavedJob(userId: string, jobId: string) {
  const existing = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  if (!existing) {
    throw new Error("Saved job not found.");
  }

  await prisma.savedJob.delete({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });
}

export async function getJobFiltersMetaService() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const employmentTypes = Object.values(EmploymentType);
  const locationTypes = Object.values(LocationType);

  const jobTypesRaw = await prisma.job.findMany({
    distinct: ["jobType"],
    select: { jobType: true },
  });

  const jobTypes = jobTypesRaw.map((j) => j.jobType);

  return {
    employmentTypes,
    locationTypes,
    jobTypes,
    categories,
  };
}

export async function GetSuggestedJobService(
  companyId: string,
  excludeJobId?: string
) {
  return await prisma.job.findMany({
    where: {
      companyId,
      id: excludeJobId ? { not: excludeJobId } : undefined,
      status: "PUBLISHED",
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      company: {
        include: { admin: true },
      },
    },
  });
}
