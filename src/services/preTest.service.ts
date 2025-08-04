import prisma from "../lib/prisma";
import {
  CreatePreSelectionTestInput,
  SubmitPreSelectionAnswerInput,
  UpdatePreSelectionTestInput,
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

export async function updatePreSelectionTest(
  jobId: string,
  data: UpdatePreSelectionTestInput
) {
  const existingTest = await prisma.preSelectionTest.findUnique({
    where: { jobId },
  });

  if (!existingTest) {
    throw new Error("Pre-selection test not found");
  }

  const currentQuestions = existingTest.questions as Array<any>;

  for (const update of data.questions) {
    const { index, question, options, correctIndex } = update;

    if (index < 0 || index >= currentQuestions.length) {
      throw new Error(`Invalid index: ${index}`);
    }

    currentQuestions[index] = {
      question,
      options,
      correctIndex,
    };
  }

  const updatedTest = await prisma.preSelectionTest.update({
    where: { jobId },
    data: {
      questions: currentQuestions,
    },
  });

  return updatedTest;
}

export async function getPreSelectionTestDetailByAdmin(
  jobId: string,
  adminId: string
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      preSelectionTest: true,
    },
  });

  if (!job || job.companyId !== company.id)
    throw new Error("Test not found or access denied");

  const test = job.preSelectionTest;

  if (!test) {
    return {
      jobId: job.id,
      testId: null,
      questions: [],
    };
  }

  const questions = test.questions as any[];

  return {
    jobId: job.id,
    testId: test.id,
    questions,
  };
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
      score: percentage,
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

export async function checkPreSelectionStatus(jobId: string, userId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { preSelectionTest: true },
  });

  if (!job || !job.hasTest || !job.preSelectionTest) {
    return { submitted: false };
  }

  const testId = job.preSelectionTest.id;

  const answer = await prisma.preSelectionAnswer.findUnique({
    where: {
      userId_testId: {
        userId,
        testId,
      },
    },
  });

  if (!answer) return { submitted: false };

  return {
    submitted: true,
    score: answer.score,
    passed: answer.passed,
    total: 25,
    submittedAt: answer.createdAt,
  };
}
