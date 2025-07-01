import { Request, Response } from "express";
import {
  createAssessment,
  getAllAssessments,
  submitAssessment,
  getAssessmentResult,
} from "../services/assessment.service";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ─────────────────────────────────────────────────────────
// Developer-only: Create new assessment
export const createAssessmentHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const developerId = req.user!.id;
    const data = await createAssessment(req.body, developerId);
    res.status(201).json(data);
  }
);

// Subscribed user: Get all active public assessments
export const getAssessmentsHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const assessments = await getAllAssessments();
    res.json(assessments);
  }
);

// Subscribed user: Submit answers to an assessment
export const submitAssessmentHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = await submitAssessment(id, userId, req.body.answers);
    res.json(data);
  }
);

// Subscribed user: Get result for a submitted assessment
export const getAssessmentResultHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await getAssessmentResult(id, userId);
    res.json(result);
  }
);

// Subscribed user: Get assessment detail (with questions)
export const getAssessmentDetailHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const assessment = await prisma.skillAssessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json(assessment);
  }
);

// Developer-only: Get all assessments created by developer
export const getDeveloperAssessmentsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const developerId = req.user!.id;
    const assessments = await prisma.skillAssessment.findMany({
      where: { developerId },
    });
    res.json(assessments);
  }
);
