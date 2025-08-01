import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

import { JobStatus, JobCategory } from "@prisma/client";
import {
  CreateJobInput,
  UpdateJobInput,
  PublishJobInput,
  ApplyJobInput,
} from "../schema/job.schema";
import {
  PaginatedJobs,
  JobFilters,
  JobWithRelations,
} from "../interfaces/jobs.interface";
import { EmploymentType, LocationType } from "@prisma/client";
import { startOfToday, subDays } from "date-fns";

export async function createJob(adminId: string, data: CreateJobInput) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found");

  const { deadline, ...rest } = data;

  const job = await prisma.job.create({
    data: {
      ...rest,
      deadline: new Date(deadline),
      companyId: company.id,
    },
  });

  return job;
}

export async function getJobsByAdmin(
  adminId: string,
  query: {
    title?: string;
    jobCategory?: JobCategory | string;
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
    jobCategory,
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
      ...(jobCategory &&
        Object.values(JobCategory).includes(jobCategory as JobCategory) && {
          jobCategory: jobCategory as JobCategory,
        }),
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
      employmentType: true,
      jobCategory: true,
      bannerUrl: true,
      hasTest: true,
      createdAt: true,
      _count: {
        select: { applications: true },
      },
    },
  });

  const total = await prisma.job.count({
    where: {
      companyId: company.id,
      ...(title && { title: { contains: title, mode: "insensitive" } }),
      ...(jobCategory &&
        Object.values(JobCategory).includes(jobCategory as JobCategory) && {
          jobCategory: jobCategory as JobCategory,
        }),
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

  if (!company) {
    throw new Error("Company not found");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      preSelectionTest: true,
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

  const { deadline, bannerUrl, ...rest } = data;

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      ...rest,
      ...(deadline && { deadline: new Date(deadline) }),
      ...(bannerUrl && { bannerUrl }),
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
    employmentType,
    jobCategory,
    isRemote,
    salaryMin,
    salaryMax,
    experienceLevel,
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    listingTime = "any",
    customStartDate,
    customEndDate,
    lat,
    lng,
    radiusKm = 100,
  } = filters;

  const skip = (page - 1) * pageSize;
  const andFilters: any[] = [];

  if (title)
    andFilters.push({ title: { contains: title, mode: "insensitive" } });
  if (location)
    andFilters.push({ location: { contains: location, mode: "insensitive" } });
  if (Array.isArray(employmentType) && employmentType.length > 0)
    andFilters.push({ employmentType: { in: employmentType } });
  if (Array.isArray(jobCategory) && jobCategory.length > 0)
    andFilters.push({ jobCategory: { in: jobCategory } });
  if (typeof isRemote === "boolean") andFilters.push({ isRemote });
  if (salaryMin !== undefined) andFilters.push({ salary: { gte: salaryMin } });
  if (salaryMax !== undefined) andFilters.push({ salary: { lte: salaryMax } });
  if (experienceLevel)
    andFilters.push({
      experienceLevel: { contains: experienceLevel, mode: "insensitive" },
    });

  if (listingTime !== "any") {
    let gteDate: Date | undefined;
    let lteDate: Date | undefined;

    switch (listingTime) {
      case "today":
        gteDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "3days":
        gteDate = subDays(new Date(), 3);
        break;
      case "7days":
        gteDate = subDays(new Date(), 7);
        break;
      case "14days":
        gteDate = subDays(new Date(), 14);
        break;
      case "30days":
        gteDate = subDays(new Date(), 30);
        break;
      case "custom":
        if (customStartDate) gteDate = new Date(customStartDate);
        if (customEndDate) lteDate = new Date(customEndDate);
        break;
    }

    const createdAtFilter: any = {};
    if (gteDate) createdAtFilter.gte = gteDate;
    if (lteDate) createdAtFilter.lte = lteDate;
    if (Object.keys(createdAtFilter).length)
      andFilters.push({ createdAt: createdAtFilter });
  }

  const now = new Date();

  const baseWhere = {
    AND: [
      ...(andFilters.length ? andFilters : []),
      { status: JobStatus.PUBLISHED },
      { deadline: { gte: now } },
    ],
  };

  const sortField = ["createdAt", "salary"].includes(sortBy)
    ? sortBy
    : "createdAt";
  const sortDir = ["asc", "desc"].includes(sortOrder) ? sortOrder : "desc";

  if (lat !== undefined && lng !== undefined) {
    const allJobs = await prisma.job.findMany({
      where: {
        ...baseWhere,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        company: {
          include: {
            admin: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { [sortField]: sortDir },
    });

    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const jobsInRadius = allJobs.filter((j) => {
      const dist =
        6371 *
        Math.acos(
          Math.cos(toRadians(lat)) *
            Math.cos(toRadians(j.latitude!)) *
            Math.cos(toRadians(j.longitude!) - toRadians(lng)) +
            Math.sin(toRadians(lat)) * Math.sin(toRadians(j.latitude!))
        );
      return dist <= radiusKm;
    });

    const paginated = jobsInRadius.slice(skip, skip + pageSize);

    return {
      total: jobsInRadius.length,
      jobs: paginated,
    };
  }

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where: baseWhere }),
    prisma.job.findMany({
      where: baseWhere,
      orderBy: { [sortField]: sortDir },
      skip,
      take: pageSize,
      include: {
        company: {
          include: {
            admin: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  return { total, jobs };
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
  const employmentTypes = Object.values(EmploymentType).map((type) => ({
    label: type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: type,
  }));

  const jobCategories = Object.values(JobCategory).map((category) => ({
    label: category
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: category,
  }));

  const isRemoteOptions = [
    { label: "Remote", value: true },
    { label: "On-site", value: false },
  ];

  const jobTypesRaw = await prisma.job.findMany({
    distinct: ["experienceLevel"],
    select: { experienceLevel: true },
  });

  const experienceLevels = jobTypesRaw
    .map((j) => j.experienceLevel)
    .filter((v, i, a) => v && a.indexOf(v) === i);

  return {
    employmentTypes,
    jobCategories,
    isRemoteOptions,
    experienceLevels,
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
      deadline: {
        gte: new Date(),
      },
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

export async function applyJobService(
  jobId: string,
  userId: string,
  data: ApplyJobInput
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { preSelectionTest: true },
  });

  if (!job) throw new Error("Job not found");

  if (job.status !== JobStatus.PUBLISHED) {
    throw new Error("You cannot apply to this job");
  }

  const now = new Date();
  if (job.deadline && new Date(job.deadline) < now) {
    throw new Error("This job has expired");
  }

  const existing = await prisma.application.findFirst({
    where: { jobId, userId },
  });

  if (existing) throw new Error("You have already applied to this job");

  let testScore: number | undefined = undefined;

  if (job.hasTest && job.preSelectionTest) {
    const answer = await prisma.preSelectionAnswer.findUnique({
      where: {
        userId_testId: {
          userId,
          testId: job.preSelectionTest.id,
        },
      },
    });

    if (!answer)
      throw new Error("Please complete the pre-selection test before applying");

    testScore = answer.score;
  }

  const newApp = await prisma.application.create({
    data: {
      jobId,
      userId,
      expectedSalary: data.expectedSalary,
      cvFile: data.cvFile,
      coverLetter: data.coverLetter,
      testScore,
    },
  });

  return newApp;
}

export async function getJobDetailsService(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      preSelectionTest: true,
      applications: true,
      interviews: true,
    },
  });
}

export async function getSavedJobsByUserPaginated(
  userId: string,
  page: number,
  pageSize: number
): Promise<{ total: number; jobs: JobWithRelations[] }> {
  const skip = (page - 1) * pageSize;

  const [total, saved] = await Promise.all([
    prisma.savedJob.count({ where: { userId } }),
    prisma.savedJob.findMany({
      where: { userId },
      skip,
      take: pageSize,
      include: {
        job: {
          include: {
            company: {
              include: {
                admin: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  return { total, jobs: saved.map((s) => s.job) };
}

export async function getNearbyJobsService(
  lat: number,
  lng: number,
  radiusKm = 100,
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;

  const allJobs = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      company: {
        include: {
          admin: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: pageSize,
  });

  const nearby = allJobs.filter((j) => {
    const radians = (deg: number) => (deg * Math.PI) / 180;
    const dist =
      6371 *
      Math.acos(
        Math.cos(radians(lat)) *
          Math.cos(radians(j.latitude!)) *
          Math.cos(radians(j.longitude!) - radians(lng)) +
          Math.sin(radians(lat)) * Math.sin(radians(j.latitude!))
      );
    return dist <= radiusKm;
  });

  return nearby.map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description,
    location: j.location,
    salary: j.salary,
    latitude: j.latitude!,
    longitude: j.longitude!,
    createdAt: j.createdAt,
    company: {
      id: j.company.id,
      logo: j.company.logo,
      admin: {
        name: j.company.admin.name,
      },
    },
  }));
}
