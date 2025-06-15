import { Request, Response, NextFunction } from "express";
import {
  createPreSelectionTest,
  getPreSelectionTestByJob,
  submitPreSelectionAnswer,
  getApplicantsWithTestResult,
} from "../services/preTest.service";

export async function createPreSelectionTestHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const newTest = await createPreSelectionTest(req.body);
    res.status(201).json({ success: true, data: newTest });
  } catch (err) {
    next(err);
  }
}

export async function getPreSelectionTestByJobHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { jobId } = req.params;
    const test = await getPreSelectionTestByJob(jobId);

    res.status(200).json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
}

export async function submitPreSelectionAnswerHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.params.jobId;
    const userId = req.user!.id;

    // req.body sudah tervalidasi oleh middleware
    const result = await submitPreSelectionAnswer(jobId, userId, req.body);

    res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getApplicantsWithTestResultHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.params.jobId;
    const result = await getApplicantsWithTestResult(jobId);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
