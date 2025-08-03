import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { generateAndSaveCertificatePdf } from "../utils/generateCertificatePDF";
import path from "path";

export const verifyCertificateHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.params;

    const cert = await prisma.certificate.findFirst({
      where: { verificationCode: code },
      include: {
        user: { select: { name: true, email: true } },
        assessment: { select: { name: true, description: true } },
      },
    });

    if (!cert) {
      return res
        .status(404)
        .json({ valid: false, message: "Certificate not found or invalid" });
    }

    return res.json({
      valid: true,
      user: cert.user,
      assessment: cert.assessment,
      issuedAt: cert.issuedAt,
      certificateUrl: cert.certificateUrl,
      qrCodeUrl: cert.qrCodeUrl,
    });
  }
);

export const downloadCertificatePdf = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        assessment: { select: { name: true } },
      },
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    await generateAndSaveCertificatePdf({ certificate: cert });

    const filePath = path.join(
      __dirname,
      `../../public/certificates/${cert.id}.pdf`
    );
    return res.download(filePath);
  }
);
