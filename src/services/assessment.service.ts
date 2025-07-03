import prisma from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

type Question = {
  question: string;
  choices: string[];
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

  // Validate answers length
  if (userAnswers.length !== questions.length) {
    throw new Error("Invalid number of answers");
  }

  // Evaluate score
  let correct = 0;
  questions.forEach((q, idx) => {
    const correctChoice = q.choices[q.answer];
    if (userAnswers[idx] === correctChoice) correct++;
  });

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= assessment.passingScore;

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

  // Auto generate certificate if passed
  if (passed) {
    const verificationCode = uuidv4();
    const verificationUrl = `${process.env.FE_URL}/certificate/verify/${verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    const certificateUrl = `https://dummy-certificate-server.com/cert/${result.id}.pdf`; // replace with actual if needed

    await prisma.certificate.create({
      data: {
        userId,
        assessmentId,
        verificationCode,
        certificateUrl,
        qrCodeUrl: qrCodeDataUrl,
      },
    });
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
