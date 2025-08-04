import { Request, Response, NextFunction } from "express";
import {
  createPreSelectionTest,
  getPreSelectionTestByJob,
  submitPreSelectionAnswer,
  getApplicantsWithTestResult,
  checkPreSelectionStatus,
  updatePreSelectionTest,
  getPreSelectionTestDetailByAdmin,
} from "../services/preTest.service";
import { UpdatePreSelectionTestInput } from "../schema/preTest.schema";

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

export async function updatePreSelectionTestHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = req.params.jobId;
    const body: UpdatePreSelectionTestInput = req.body;

    const result = await updatePreSelectionTest(jobId, body);

    res.json({
      success: true,
      data: result,
    });
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

export async function getPreSelectionTestByAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { jobId } = req.params;
    const adminId = req.user!.id;
    const data = await getPreSelectionTestDetailByAdmin(jobId, adminId);

    res.json({ success: true, data });
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

export async function getPreSelectionStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobId = req.params.jobId;
    const userId = req.user!.id;

    const result = await checkPreSelectionStatus(jobId, userId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
