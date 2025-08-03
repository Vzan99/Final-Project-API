import prisma from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { generateAndSaveCertificatePdf } from "../utils/generateCertificatePDF";

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

// ─── DEVELOPER ─────────────────────────────
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

export const getDeveloperAssessments = async (developerId: string) => {
  return prisma.skillAssessment.findMany({ where: { developerId } });
};

export const updateAssessment = async (
  assessmentId: string,
  developerId: string,
  data: Partial<AssessmentInput>
) => {
  const existing = await prisma.skillAssessment.findUnique({
    where: { id: assessmentId },
    include: { userAssessments: true },
  });
  if (!existing || existing.developerId !== developerId)
    throw new Error("Assessment not found");
  if (existing.userAssessments.length > 0)
    throw new Error("Assessment sudah dikerjakan dan tidak bisa diubah");

  return prisma.skillAssessment.update({ where: { id: assessmentId }, data });
};

export const deleteAssessment = async (
  assessmentId: string,
  developerId: string
) => {
  const existing = await prisma.skillAssessment.findUnique({
    where: { id: assessmentId },
    include: { userAssessments: true },
  });
  if (!existing || existing.developerId !== developerId)
    throw new Error("Assessment not found");
  if (existing.userAssessments.length > 0)
    throw new Error("Assessment sudah dikerjakan dan tidak bisa dihapus");

  return prisma.skillAssessment.delete({ where: { id: assessmentId } });
};

// ─── USER ─────────────────────────────
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

export const getAssessmentDetail = async (assessmentId: string) => {
  return prisma.skillAssessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      name: true,
      description: true,
      timeLimit: true,
      questions: true,
    },
  });
};

export const submitAssessment = async (
  assessmentId: string,
  userId: string,
  userAnswers: string[]
) => {
  const existing = await prisma.userAssessment.findFirst({
    where: { userId, assessmentId },
  });
  if (existing) throw new Error("Assessment sudah pernah dikerjakan");

  const assessment = await prisma.skillAssessment.findUnique({
    where: { id: assessmentId },
  });
  if (!assessment) throw new Error("Assessment not found");

  const questions = assessment.questions as Question[];
  if (userAnswers.length !== questions.length)
    throw new Error("Jumlah jawaban tidak sesuai");

  let correct = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.options[q.answer]) correct++;
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
    const verificationCode = uuidv4();
    const feUrl = process.env.FE_URL || "http://localhost:3000";
    const qrCodeDataUrl = await QRCode.toDataURL(
      `${feUrl}/certificates/verify/${verificationCode}`
    );

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        assessmentId,
        verificationCode,
        certificateUrl: `${feUrl}/certificates/${result.id}.pdf`,
        qrCodeUrl: qrCodeDataUrl,
      },
      include: {
        user: { select: { name: true } },
        assessment: { select: { name: true } },
      },
    });

    await generateAndSaveCertificatePdf({ certificate });
  }

  return result;
};

export const getUserAssessmentResults = async (userId: string) => {
  const results = await prisma.userAssessment.findMany({
    where: { userId },
    include: { assessment: { select: { id: true, name: true } } },
  });

  const certificates = await prisma.certificate.findMany({
    where: { userId },
    select: {
      assessmentId: true,
      certificateUrl: true,
      issuedAt: true,
      qrCodeUrl: true,
      id: true,
    },
  });

  return results.map((r) => {
    const cert = certificates.find((c) => c.assessmentId === r.assessmentId);
    return {
      id: r.id,
      assessmentId: r.assessmentId,
      assessmentName: r.assessment.name,
      score: r.score,
      passed: r.passed,
      badge: r.badge,
      certificateId: cert?.id ?? null,
      certificateUrl: cert?.certificateUrl ?? null,
      issuedAt: cert?.issuedAt ?? null,
      qrCodeUrl: cert?.qrCodeUrl ?? null,
    };
  });
};

export const getUserAssessmentResult = async (
  userId: string,
  assessmentId: string
) => {
  const result = await prisma.userAssessment.findFirst({
    where: { userId, assessmentId },
  });
  if (!result) return null;

  const cert = await prisma.certificate.findFirst({
    where: { userId, assessmentId },
  });

  return {
    id: result.id,
    score: result.score,
    passed: result.passed,
    badge: result.badge,
    certificateId: cert?.id ?? null,
  };
};
