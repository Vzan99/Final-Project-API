import prisma from "../lib/prisma";
import {
  CreateInterviewInput,
  UpdateInterviewInput,
} from "../schema/interview.schema";

export async function createInterview(
  adminId: string,
  input: CreateInterviewInput
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
  });
  if (!job || job.companyId !== company.id)
    throw new Error("Unauthorized to schedule for this job");

  const interview = await prisma.interviewSchedule.create({
    data: {
      ...input,
      dateTime: new Date(input.dateTime),
    },
    include: {
      user: true,
      job: true,
    },
  });
  // send email here

  return interview;
}

export async function getInterviewsByJob(jobId: string, adminId: string) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job || job.companyId !== company.id)
    throw new Error("Unauthorized access to this job");

  const interviews = await prisma.interviewSchedule.findMany({
    where: { jobId },
    orderBy: { dateTime: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return interviews;
}

export async function updateInterviewById(
  id: string,
  adminId: string,
  data: UpdateInterviewInput
) {
  const interview = await prisma.interviewSchedule.findUnique({
    where: { id },
    include: {
      job: true,
    },
  });

  if (!interview) throw new Error("Interview not found");

  const job = interview.job;
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company || job.companyId !== company.id) {
    throw new Error("Unauthorized access");
  }

  const updated = await prisma.interviewSchedule.update({
    where: { id },
    data: {
      ...data,
      dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
    },
  });

  return updated;
}

export async function deleteInterviewById(id: string, adminId: string) {
  const interview = await prisma.interviewSchedule.findUnique({
    where: { id },
    include: { job: true },
  });

  if (!interview) throw new Error("Interview not found");

  const job = interview.job;

  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company || job.companyId !== company.id) {
    throw new Error("Unauthorized access");
  }

  await prisma.interviewSchedule.delete({
    where: { id },
  });

  return { id };
}
