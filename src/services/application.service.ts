import prisma from "../lib/prisma";
import { UpdateApplicationStatusInput } from "../schema/application.schema";

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
        },
      },
    },
  });

  return applications.map((app) => {
    const test = app.user.preSelectionAnswers[0];

    return {
      id: app.id,
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
            where: {
              test: {
                jobId: {
                  equals: undefined,
                },
              },
            },
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
