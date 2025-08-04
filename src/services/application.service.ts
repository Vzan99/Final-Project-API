import prisma from "../lib/prisma";
import { UpdateApplicationStatusInput } from "../schema/application.schema";
import { ApplyJobInput } from "../schema/application.schema";
import { JobStatus, ApplicationStatus } from "@prisma/client";

export async function getApplicantsByJob(
  jobId: string,
  adminId: string,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { companyId: true, hasTest: true },
  });
  if (!job || job.companyId !== company.id)
    throw new Error("Unauthorized access to this job");

  const [total, applications] = await Promise.all([
    prisma.application.count({ where: { jobId } }),
    prisma.application.findMany({
      where: { jobId },
      skip,
      take: limit,
      include: {
        job: { select: { id: true, title: true } },
        user: {
          include: {
            profile: true,
            preSelectionAnswers: {
              where: { test: { jobId } },
              include: { test: true },
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
            interviewSchedules: {
              where: { jobId },
              orderBy: { dateTime: "desc" },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  return {
    hasTest: job.hasTest,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    applicants: applications.map((app) => {
      const user = app.user;
      const test = user.preSelectionAnswers.find(
        (a) => a.test.jobId === app.jobId
      );
      const subscription = user.subscriptions?.[0];
      const latestInterview = user.interviewSchedules?.[0];

      return {
        // Data Aplikasi
        id: app.id,
        status: app.status,
        expectedSalary: app.expectedSalary,
        cvFile: app.cvFile,
        coverLetter: app.coverLetter,
        appliedAt: app.createdAt,

        // Data User
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
        },

        // Data Pekerjaan
        job: {
          id: app.job.id,
          title: app.job.title,
        },

        // Data Pre-selection Test
        test: test
          ? {
              score: test.score,
              passed: test.passed,
              submittedAt: test.createdAt,
            }
          : null,

        // Subscription
        subscriptionType: subscription?.type ?? null,

        // Interview
        interviewStatus: latestInterview?.status ?? null,
      };
    }),
  };
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

export async function checkIfUserApplied(jobId: string, userId: string) {
  const existing = await prisma.application.findFirst({
    where: {
      jobId,
      userId,
    },
  });

  return !!existing;
}

export async function getUserApplicationService(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  status?: ApplicationStatus
) {
  const skip = (page - 1) * pageSize;

  const where: any = { userId };
  if (status) where.status = status;

  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        feedback: true,
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            company: {
              select: {
                admin: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    applications,
  };
}

export async function submitApplicationFeedback(
  applicationId: string,
  feedback: string
) {
  if (!feedback.trim()) {
    throw new Error("Feedback must not be empty");
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { feedback: feedback.trim() },
  });

  return updated;
}
