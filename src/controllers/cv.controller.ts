import { Request, Response } from "express";
import prisma from "../lib/prisma";
import PDFDocument from "pdfkit";

export const getCVFormData = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    res.status(404).json({ message: "User profile not found" });
    return;
  }

  res.json({
    name: user.name,
    email: user.email,
    ...user.profile,
  });
};

export const generateCV = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { summary, extraSkills = [], projects = [] } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    res.status(404).json({ message: "User profile not found" });
    return;
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=cv.pdf");

  doc.pipe(res); // ⬅️ Pipe dulu sebelum isi konten

  doc.fontSize(20).text(user.name);
  doc.fontSize(12).text(user.email);
  doc.moveDown();

  doc.fontSize(14).text("Summary:");
  doc.fontSize(12).text(summary || "-");
  doc.moveDown();

  doc.fontSize(14).text("Skills:");
  const allSkills = [...(user.profile.skills || []), ...extraSkills];
  doc.fontSize(12).text(allSkills.length ? allSkills.join(", ") : "-");
  doc.moveDown();

  doc.fontSize(14).text("Projects:");
  if (projects.length) {
    projects.forEach((p: any) => {
      doc.fontSize(12).text(`• ${p.name}: ${p.desc}`);
    });
  } else {
    doc.fontSize(12).text("-");
  }

  doc.end(); //
};
