import prisma from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type AssessmentInput = {
  name: string;
  description?: string;
  questions: Question[];
  passingScore?: number;
  timeLimit?: number;
};

// Developer creates assessment
export const createAssessment = async (
  input: AssessmentInput,
  developerId: string
) => {
  return prisma.skillAssessment.create({
    data: {
      name: input.name,
      description: input.description,
      passingScore: input.passingScore ?? 75,
      timeLimit: input.timeLimit ?? 30,
      questions: input.questions,
      developerId,
    },
  });
};

// User fetches all public assessments
export const getAllAssessments = async () => {
  return prisma.skillAssessment.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      timeLimit: true,
    },
  });
};

// User submits answers to an assessment
export const submitAssessment = async (
  assessmentId: string,
  userId: string,
  userAnswers: string[]
) => {
  const assessment = await prisma.skillAssessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) throw new Error("Assessment not found");

  const questions = assessment.questions as Question[];

  if (!Array.isArray(questions) || userAnswers.length !== questions.length) {
    throw new Error("Invalid number of answers");
  }

  let correct = 0;
  questions.forEach((q, idx) => {
    if (
      Array.isArray(q.options) &&
      typeof q.answer === "number" &&
      q.answer >= 0 &&
      q.answer < q.options.length
    ) {
      const correctOption = q.options[q.answer];
      if (userAnswers[idx] === correctOption) correct++;
    }
  });

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= (assessment.passingScore ?? 75);

  const result = await prisma.userAssessment.create({
    data: {
      userId,
      assessmentId,
      score,
      passed,
      answers: userAnswers,
      badge: passed ? assessment.name : "",
    },
  });

  if (passed) {
    try {
      const verificationCode = uuidv4();
      const feUrl = process.env.FE_URL || "http://localhost:3000";
      const verificationUrl = `${feUrl}/certificate/verify/${verificationCode}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

      const certificateUrl = `https://dummy-certificate-server.com/cert/${result.id}.pdf`;

      await prisma.certificate.create({
        data: {
          userId,
          assessmentId,
          verificationCode,
          certificateUrl,
          qrCodeUrl: qrCodeDataUrl,
        },
      });
    } catch (_) {}
  }

  return result;
};

// Get result for a specific user-assessment
export const getAssessmentResult = async (
  assessmentId: string,
  userId: string
) => {
  return prisma.userAssessment.findFirst({
    where: { assessmentId, userId },
  });
};
