import prisma from "../lib/prisma";
import {
  CreatePreSelectionTestInput,
  SubmitPreSelectionAnswerInput,
} from "../schema/preTest.schema";

export async function createPreSelectionTest(
  data: CreatePreSelectionTestInput
) {
  const { jobId, questions } = data;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  if (!job.hasTest) {
    throw new Error("This job is not configured to use pre-selection test");
  }

  const existingTest = await prisma.preSelectionTest.findUnique({
    where: { jobId },
  });
  if (existingTest) throw new Error("Test for this job already exists");

  const newTest = await prisma.preSelectionTest.create({
    data: {
      jobId,
      questions,
    },
  });

  return newTest;
}

export async function getPreSelectionTestByJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { preSelectionTest: true },
  });

  if (!job || !job.hasTest || !job.preSelectionTest)
    throw new Error("No pre-selection test found for this job");

  const test = job.preSelectionTest;
  const rawQuestions = test.questions as any[];

  const questions = rawQuestions.map((q) => {
    const { correctIndex, ...rest } = q;
    return rest;
  });

  return {
    jobId,
    testId: test.id,
    questions,
  };
}

export async function submitPreSelectionAnswer(
  jobId: string,
  userId: string,
  payload: SubmitPreSelectionAnswerInput
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { preSelectionTest: true },
  });

  if (!job || !job.hasTest || !job.preSelectionTest) {
    throw new Error("Pre-selection test not available for this job.");
  }

  const test = job.preSelectionTest;

  const existing = await prisma.preSelectionAnswer.findUnique({
    where: {
      userId_testId: {
        userId,
        testId: test.id,
      },
    },
  });
  if (existing) throw new Error("You have already submitted this test.");

  const correctAnswers = (test.questions as any[]).map((q) => q.correctIndex);
  const userAnswers = payload.answers;

  let score = 0;
  correctAnswers.forEach((correct, i) => {
    if (userAnswers[i] === correct) score++;
  });

  const percentage = (score / 25) * 100;
  const passed = percentage >= 75;

  const saved = await prisma.preSelectionAnswer.create({
    data: {
      userId,
      testId: test.id,
      score,
      passed,
      answers: userAnswers,
    },
  });

  return {
    score,
    passed,
    total: 25,
    correct: score,
  };
}

export async function getApplicantsWithTestResult(jobId: string) {
  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      user: {
        include: {
          profile: true,
          preSelectionAnswers: {
            where: {
              test: {
                jobId,
              },
            },
          },
        },
      },
    },
  });

  return applications.map((app) => {
    const user = app.user;
    const profile = user.profile;

    const test = user.preSelectionAnswers[0];

    return {
      name: user.name,
      email: user.email,
      photoUrl: profile?.photoUrl ?? null,
      education: profile?.education ?? null,
      expectedSalary: app.expectedSalary,
      status: app.status,
      cvFile: app.cvFile,
      testScore: test?.score ?? null,
      passed: test?.passed ?? null,
      submittedAt: test?.createdAt ?? null,
    };
  });
}
