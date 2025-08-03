import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { Certificate, User, SkillAssessment } from "@prisma/client";

export const generateAndSaveCertificatePdf = async ({
  certificate,
}: {
  certificate: Certificate & {
    user: Pick<User, "name">;
    assessment: Pick<SkillAssessment, "name">;
  };
}) => {
  const dir = path.join(__dirname, "../../public/certificates");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${certificate.id}.pdf`);
  const stream = fs.createWriteStream(filePath);

  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(stream);

    doc
      .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
      .stroke("#aaaaaa");

    doc
      .fontSize(24)
      .fillColor("#333")
      .text("Certificate of Completion", { align: "center" })
      .moveDown();

    doc
      .fontSize(20)
      .fillColor("#000")
      .text(certificate.user.name, { align: "center" })
      .moveDown();

    doc
      .fontSize(14)
      .fillColor("#444")
      .text(
        `has successfully completed the skill assessment: "${certificate.assessment.name}"`,
        { align: "center" }
      )
      .moveDown();

    doc
      .fontSize(12)
      .fillColor("#666")
      .text(
        `Issued on: ${new Date(certificate.issuedAt).toLocaleDateString()}`,
        { align: "center" }
      );

    if (certificate.qrCodeUrl) {
      doc.image(certificate.qrCodeUrl, doc.page.width / 2 - 50, doc.y + 20, {
        width: 100,
        height: 100,
        align: "center",
      });
    }

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
};
