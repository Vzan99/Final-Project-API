import PDFDocument from "pdfkit";
import { Response } from "express";
import { Certificate, User, SkillAssessment } from "@prisma/client";
import fs from "fs";
import path from "path";

interface CertificateData {
  certificate: Certificate & {
    user: Pick<User, "name">;
    assessment: Pick<SkillAssessment, "name">;
  };
  res: Response;
}

export const generateCertificatePdf = ({
  certificate,
  res,
}: CertificateData) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=certificate-${certificate.id}.pdf`
  );

  doc.pipe(res);

  // Background or border
  doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke("#aaaaaa");

  // Header
  doc
    .fontSize(24)
    .fillColor("#333")
    .text("Certificate of Completion", { align: "center" });

  doc.moveDown();

  // Name
  doc
    .fontSize(20)
    .fillColor("#000")
    .text(certificate.user.name, { align: "center" });

  doc.moveDown();

  // Assessment
  doc
    .fontSize(14)
    .fillColor("#444")
    .text(
      `has successfully completed the skill assessment: "${certificate.assessment.name}"`,
      { align: "center" }
    );

  doc.moveDown();

  doc
    .fontSize(12)
    .fillColor("#666")
    .text(`Issued on: ${new Date(certificate.issuedAt).toLocaleDateString()}`, {
      align: "center",
    });

  doc.end();
};
