import { Response as ExpressResponse } from "express";
import prisma from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { streamCertificatePdf } from "../utils/PDFhelper";

type Question = {
  id: string;
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
  const questionsWithId = input.questions.map((q) => ({
    ...q,
    id: uuidv4(),
  }));

  return prisma.skillAssessment.create({
    data: {
      name: input.name,
      description: input.description,
      passingScore: input.passingScore ?? 75,
      timeLimit: input.timeLimit ?? 30,
      questions: questionsWithId,
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
  userAnswers: { questionId: string; selectedAnswer: string }[]
) => {
  const [assessment, subscription, attemptCount, hasPassedBefore] =
    await Promise.all([
      prisma.skillAssessment.findUnique({ where: { id: assessmentId } }),
      prisma.subscription.findFirst({
        where: {
          userId,
          isApproved: true,
          paymentStatus: "PAID",
        },
        select: { type: true },
      }),
      prisma.userAssessment.count({
        where: { userId, assessmentId },
      }),
      prisma.userAssessment.findFirst({
        where: { userId, assessmentId, passed: true },
      }),
    ]);

  if (!assessment) throw new Error("Assessment not found");

  const questions = assessment.questions as Question[];
  if (!questions || questions.length === 0)
    throw new Error("Soal assessment belum tersedia.");

  if (questions.length !== 25)
    throw new Error("Assessment harus terdiri dari 25 soal.");

  if (userAnswers.length !== questions.length)
    throw new Error("Jumlah jawaban tidak sesuai dengan jumlah soal.");

  if (userAnswers.every((a) => a.selectedAnswer === ""))
    throw new Error("Jawaban kosong tidak bisa disubmit.");

  const maxAllowed =
    subscription?.type?.toUpperCase() === "PROFESSIONAL" ? Infinity : 2;

  if (attemptCount >= maxAllowed) {
    throw new Error("Batas maksimum percobaan assessment telah tercapai.");
  }

  if (hasPassedBefore) {
    throw new Error("Kamu sudah lulus assessment ini.");
  }

  // Mapping soal berdasarkan ID
  const questionMap = new Map<string, Question>();
  questions.forEach((q) => questionMap.set(q.id, q));

  let correct = 0;
  for (const ans of userAnswers) {
    const q = questionMap.get(ans.questionId);
    if (q && q.options[q.answer] === ans.selectedAnswer) correct++;
  }

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= (assessment.passingScore ?? 75);

  const result = await prisma.userAssessment.create({
    data: {
      userId,
      assessmentId,
      score,
      passed,
      badge: passed ? assessment.name : "",
      answers: userAnswers,
    },
  });

  // Jika lulus, generate sertifikat otomatis
  if (passed) {
    const code = uuidv4();
    const qrData = `${
      process.env.FE_URL || "http://localhost:3000"
    }/certificates/verify/${code}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    await prisma.certificate.create({
      data: {
        userId,
        assessmentId,
        issuedAt: new Date(),
        verificationCode: code,
        qrCodeUrl: qrCodeImage,
        certificateUrl: "", // opsional: bisa isi URL API download kalau mau
      },
    });
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
  const [assessment, result, cert, attemptCount, subscription] =
    await Promise.all([
      prisma.skillAssessment.findUnique({
        where: { id: assessmentId },
        select: { name: true },
      }),
      prisma.userAssessment.findFirst({
        where: { userId, assessmentId },
      }),
      prisma.certificate.findFirst({
        where: { userId, assessmentId },
      }),
      prisma.userAssessment.count({
        where: { userId, assessmentId },
      }),
      prisma.subscription.findFirst({
        where: {
          userId,
          isApproved: true,
          paymentStatus: "PAID",
        },
        select: { type: true },
      }),
    ]);

  const maxAllowedAttempts =
    subscription?.type?.toUpperCase() === "PROFESSIONAL" ? Infinity : 2;

  return {
    id: result?.id ?? null,
    score: result?.score ?? null,
    passed: result?.passed ?? null,
    badge: result?.badge ?? null,
    certificateId: cert?.id ?? null,
    totalAttempts: attemptCount,
    maxAllowedAttempts,
    assessmentTitle: assessment?.name ?? null,
  };
};

export const streamAssessmentCertificate = async (
  userId: string,
  certificateId: string,
  res: ExpressResponse
) => {
  const certificate = await prisma.certificate.findFirst({
    where: { id: certificateId, userId },
    include: {
      user: { select: { name: true } },
      assessment: { select: { name: true } },
    },
  });

  if (!certificate) throw new Error("Certificate not found");

  await streamCertificatePdf({
    certificate: {
      user: certificate.user,
      assessment: certificate.assessment,
      createdAt: certificate.issuedAt,
      code: certificate.verificationCode,
    },
    res,
  });
};

export const verifyCertificate = async (code: string) => {
  const certificate = await prisma.certificate.findFirst({
    where: { verificationCode: code },
    include: {
      user: {
        select: { name: true, email: true },
      },
      assessment: {
        select: { name: true },
      },
    },
  });

  if (!certificate) return null;

  const baseUrl = process.env.FE_URL || "http://localhost:3000";

  return {
    id: certificate.id,
    issuedAt: certificate.issuedAt,
    user: certificate.user,
    assessment: certificate.assessment,
    qrCodeUrl: `${baseUrl}/certificates/verify/${code}`,
    certificateUrl: `${baseUrl}/api/preview/certificates/${certificate.id}`,
  };
};
