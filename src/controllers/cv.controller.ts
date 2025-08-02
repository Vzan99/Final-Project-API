import { Request, Response } from "express";
import prisma from "../lib/prisma";
import PDFDocument from "pdfkit";

export const getCVFormData = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          experiences: true,
        },
      },
    },
  });

  if (!user || !user.profile) {
    return res.status(404).json({ message: "User profile not found" });
  }

  const experienceText = user.profile.experiences
    .map((exp) => {
      const start = exp.startDate.toISOString().split("T")[0];
      const end = exp.endDate
        ? exp.endDate.toISOString().split("T")[0]
        : "Present";
      return `• ${exp.title} at ${exp.companyName} (${start} - ${end})\n${
        exp.description || ""
      }`;
    })
    .join("\n\n");

  res.json({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    about: user.profile.about || "",
    experience: experienceText,
    education: user.profile.education || "",
    skills: (user.profile.skills || []).join(", "),
  });
};

export const generateCV = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const {
    name,
    email,
    phone,
    about,
    experience,
    education,
    extraSkills = [],
    projects = [],
  } = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=cv.pdf");

  doc.pipe(res);

  doc.fontSize(20).text(name || "-");
  doc.fontSize(12).text(`${email || "-"} | ${phone || "-"}`);
  doc.moveDown();

  doc.fontSize(14).text("About:");
  doc.fontSize(12).text(about || "-");
  doc.moveDown();

  doc.fontSize(14).text("Experience:");
  doc.fontSize(12).text(experience || "-");
  doc.moveDown();

  doc.fontSize(14).text("Education:");
  doc.fontSize(12).text(education || "-");
  doc.moveDown();

  doc.fontSize(14).text("Skills:");
  doc.fontSize(12).text(extraSkills.length ? extraSkills.join(", ") : "-");
  doc.moveDown();

  doc.fontSize(14).text("Projects:");
  if (projects.length) {
    projects.forEach((p: any) => {
      doc.fontSize(12).text(`• ${p.name}: ${p.desc}`);
    });
  } else {
    doc.fontSize(12).text("-");
  }

  doc.end();
};
