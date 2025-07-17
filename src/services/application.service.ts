import prisma from "../lib/prisma";
import { UpdateApplicationStatusInput } from "../schema/application.schema";
import { ApplyJobInput } from "../schema/application.schema";
import { JobStatus, ApplicationStatus } from "@prisma/client";

export async function getApplicantsByJob(jobId: string, adminId: string) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job || job.companyId !== company.id)
    throw new Error("Unauthorized access to this job");

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      user: {
        include: {
          profile: true,
          preSelectionAnswers: {
            where: {
              test: { jobId },
            },
          },
          subscriptions: {
            where: {
              isApproved: true,
              paymentStatus: "PAID",
              endDate: { gte: new Date() },
            },
            orderBy: { endDate: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  return applications.map((app) => {
    const test = app.user.preSelectionAnswers[0];
    const subscription = app.user.subscriptions?.[0];

    return {
      id: app.id,
      userId: app.user.id,
      name: app.user.name,
      email: app.user.email,
      photoUrl: app.user.profile?.photoUrl ?? null,
      education: app.user.profile?.education ?? null,
      cvFile: app.cvFile,
      coverLetter: app.coverLetter,
      expectedSalary: app.expectedSalary,
      status: app.status,
      createdAt: app.createdAt,
      testScore: test?.score ?? null,
      passed: test?.passed ?? null,
      submittedAt: test?.createdAt ?? null,
      subscriptionType: subscription?.type ?? null,
    };
  });
}

export async function getApplicationDetail(
  applicationId: string,
  adminId: string
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      user: {
        include: {
          profile: true,
          preSelectionAnswers: {
            include: {
              test: true,
            },
          },
        },
      },
    },
  });

  if (!application) throw new Error("Application not found");
  if (application.job.companyId !== company.id)
    throw new Error("Unauthorized access");

  const test = application.user.preSelectionAnswers.find(
    (a) => a.test.jobId === application.jobId
  );

  return {
    id: application.id,
    status: application.status,
    expectedSalary: application.expectedSalary,
    cvFile: application.cvFile,
    coverLetter: application.coverLetter,
    appliedAt: application.createdAt,

    user: {
      id: application.user.id,
      name: application.user.name,
      email: application.user.email,
      profile: application.user.profile,
    },

    job: {
      id: application.job.id,
      title: application.job.title,
    },

    test: test
      ? {
          score: test.score,
          passed: test.passed,
          submittedAt: test.createdAt,
        }
      : null,
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  adminId: string,
  data: UpdateApplicationStatusInput
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company) throw new Error("Company not found");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });

  if (!application) throw new Error("Application not found");
  if (application.job.companyId !== company.id)
    throw new Error("Unauthorized access");

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: data.status },
  });

  return updated;
}

export async function applyToJobService(
  userId: string,
  jobId: string,
  input: ApplyJobInput
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job || job.status !== JobStatus.PUBLISHED) {
    throw new Error("Job is not available for applications");
  }

  const existingApplication = await prisma.application.findFirst({
    where: { userId, jobId },
  });

  if (existingApplication) {
    throw new Error("You have already applied to this job");
  }

  const application = await prisma.application.create({
    data: {
      userId,
      jobId,
      expectedSalary: input.expectedSalary,
      cvFile: input.cvFile,
      coverLetter: input.coverLetter,
      status: ApplicationStatus.PENDING,
    },
  });

  return application;
}
