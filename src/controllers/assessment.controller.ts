import { asyncHandler } from "../utils/asyncHandler";
import {
  createAssessment,
  getAllAssessments,
  submitAssessment,
  getAssessmentDetail,
  getDeveloperAssessments,
  updateAssessment,
  deleteAssessment,
  getUserAssessmentResults,
  getUserAssessmentResult,
  streamAssessmentCertificate,
  verifyCertificate,
} from "../services/assessment.service";
import { Response as ExpressResponse } from "express";

export const getAssessmentsHandler = asyncHandler(async (_req, res) => {
  const data = await getAllAssessments();
  res.json(data);
});

export const submitAssessmentHandler = asyncHandler(async (req, res) => {
  const result = await submitAssessment(
    req.params.id,
    req.user!.id,
    req.body.answers
  );
  res.json(result);
});

export const getAssessmentDetailHandler = asyncHandler(async (req, res) => {
  const assessment = await getAssessmentDetail(req.params.id);
  if (!assessment)
    return res.status(404).json({ message: "Assessment not found" });
  res.json(assessment);
});

export const getUserAssessmentResultsHandler = asyncHandler(
  async (req, res) => {
    const data = await getUserAssessmentResults(req.user!.id);
    res.json(data);
  }
);

export const getAssessmentResultByIdHandler = asyncHandler(async (req, res) => {
  const result = await getUserAssessmentResult(req.user!.id, req.params.id);
  if (!result) return res.status(404).json({ message: "Result not found" });
  res.json(result);
});

export const createAssessmentHandler = asyncHandler(async (req, res) => {
  const data = await createAssessment(req.body, req.user!.id);
  res.status(201).json(data);
});

export const getDeveloperAssessmentsHandler = asyncHandler(async (req, res) => {
  const data = await getDeveloperAssessments(req.user!.id);
  res.json(data);
});

export const updateAssessmentHandler = asyncHandler(async (req, res) => {
  const data = await updateAssessment(req.params.id, req.user!.id, req.body);
  res.json(data);
});

export const deleteAssessmentHandler = asyncHandler(async (req, res) => {
  await deleteAssessment(req.params.id, req.user!.id);
  res.json({ message: "Assessment deleted" });
});

export const previewCertificatePDFHandler = asyncHandler(
  async (req, res: ExpressResponse) => {
    await streamAssessmentCertificate(req.user!.id, req.params.id, res);
  }
);

export const verifyCertificateHandler = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const data = await verifyCertificate(code);

  if (!data) return res.status(404).json({ message: "Certificate not found" });

  res.json(data);
});
