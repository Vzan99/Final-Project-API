import prisma from "../lib/prisma";
import { JobStatus } from "@prisma/client";
import {
  CreateJobInput,
  UpdateJobInput,
  PublishJobInput,
} from "../schema/job.schema";

export async function createJob(data: CreateJobInput, adminId: string) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) {
    throw new Error("Company not found for this admin.");
  }

  const job = await prisma.job.create({
    data: {
      ...data,
      companyId: company.id,
      status: "DRAFT", // default status
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
    orderBy: {
      createdAt: sort,
    },
    skip,
    take: limit,
    include: {
      _count: {
        select: { applications: true },
      },
      category: true,
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

  const updated = await prisma.job.update({
    where: { id: jobId },
    data,
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
