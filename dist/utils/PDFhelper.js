"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamCertificatePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const streamCertificatePdf = (_a) => __awaiter(void 0, [_a], void 0, function* ({ certificate, res, }) {
    const doc = new pdfkit_1.default({
        size: "A4",
        margin: 50,
        info: {
            Title: "Certificate of Completion",
            Author: "Precise",
        },
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=certificate.pdf");
    doc.pipe(res);
    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f9f9f9");
    // Title
    doc
        .fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(26)
        .text("Certificate of Completion", {
        align: "center",
        underline: true,
    });
    doc.moveDown(2);
    // Subtitle
    doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#000")
        .text(`This certificate is proudly presented to:`, {
        align: "center",
    });
    doc.moveDown(1);
    // Recipient name
    doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor("#2c3e50")
        .text(certificate.user.name, {
        align: "center",
    });
    doc.moveDown(1.5);
    // Assessment info
    doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#000")
        .text(`For successfully completing the assessment`, {
        align: "center",
    });
    doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#1d4ed8")
        .text(`"${certificate.assessment.name}"`, {
        align: "center",
    });
    doc.moveDown(2);
    // Date & code
    doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#555")
        .text(`Issued on: ${certificate.createdAt.toLocaleDateString("id-ID")}`, {
        align: "center",
    })
        .text(`Verification Code: ${certificate.code}`, {
        align: "center",
    });
    // QR Code
    const baseUrl = process.env.FE_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/certificates/verify/${certificate.code}`;
    const qrCodeDataUrl = yield qrcode_1.default.toDataURL(verifyUrl);
    const qrImage = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(qrImage, "base64");
    const qrX = doc.page.width / 2 - 50;
    const qrY = doc.page.height - 180;
    // "Precise Team" above QR
    doc
        .fontSize(12)
        .fillColor("#000")
        .font("Helvetica-Bold")
        .text("Precise Team", qrX, qrY - 30, {
        width: 100,
        align: "center",
    });
    doc.image(qrBuffer, qrX, qrY, {
        width: 100,
        height: 100,
    });
    doc
        .fontSize(10)
        .fillColor("#666")
        .font("Helvetica")
        .text("Scan to verify", qrX, qrY + 105, {
        width: 100,
        align: "center",
    });
    doc.end();
});
exports.streamCertificatePdf = streamCertificatePdf;
