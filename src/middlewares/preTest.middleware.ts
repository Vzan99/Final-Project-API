import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export async function VerifyPreSelectionPassed(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { preSelectionTest: true },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.hasTest || !job.preSelectionTest) {
      // Tidak punya test → langsung lanjut
      return next();
    }

    const test = job.preSelectionTest;

    const answer = await prisma.preSelectionAnswer.findUnique({
      where: {
        userId_testId: {
          userId,
          testId: test.id,
        },
      },
    });

    if (!answer) {
      return res
        .status(403)
        .json({ message: "You must complete the pre-selection test first." });
    }

    if (!answer.passed) {
      return res
        .status(403)
        .json({ message: "You did not pass the pre-selection test." });
    }

    // Passed
    next();
  } catch (err) {
    next(err);
  }
}
