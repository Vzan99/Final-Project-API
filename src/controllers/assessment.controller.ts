import { Request, Response } from "express";
import {
  createAssessment,
  getAllAssessments,
  submitAssessment,
  getAssessmentResult,
} from "../services/assessment.service";
import { asyncHandler } from "../utils/asyncHandler";

// Developer only: Create new assessment
export const createAssessmentHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const developerId = req.user!.id;
    const data = await createAssessment(req.body, developerId);
    res.status(201).json(data);
  }
);

// GET all active assessments (user with subscription)
export const getAssessmentsHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const assessments = await getAllAssessments();
    res.json(assessments);
  }
);

// User submits answers to an assessment
export const submitAssessmentHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = await submitAssessment(id, userId, req.body.answers);
    res.json(data);
  }
);

// Get user's result for a specific assessment
export const getAssessmentResultHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await getAssessmentResult(id, userId);
    res.json(result);
  }
);
