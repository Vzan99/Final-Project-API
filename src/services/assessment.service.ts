import prisma from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

// Developer creates assessment
export const createAssessment = async (input: any, developerId: string) => {
  return prisma.skillAssessment.create({
    data: {
      ...input,
      questions: input.questions, // Array of { question, choices, answer }
      developerId,
    },
  });
};

// User fetches available assessments
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

// User submits answers to assessment
export const submitAssessment = async (
  assessmentId: string,
  userId: string,
  userAnswers: any[]
) => {
  const assessment = await prisma.skillAssessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) throw new Error("Assessment not found");

  const questions = assessment.questions as any[];
  let correct = 0;

  questions.forEach((q, idx) => {
    if (q.answer === userAnswers[idx]) correct++;
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

  // Sertifikat otomatis jika lulus
  if (passed) {
    const verificationCode = uuidv4();
    const verificationUrl = `${process.env.FE_URL}/certificate/verify/${verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    const certificateUrl = `https://fake-cert-server.com/cert/${result.id}.pdf`; // dummy, nanti bisa diganti hasil PDF

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

// Get result for user-assessment
export const getAssessmentResult = async (
  assessmentId: string,
  userId: string
) => {
  return prisma.userAssessment.findFirst({
    where: { assessmentId, userId },
  });
};
