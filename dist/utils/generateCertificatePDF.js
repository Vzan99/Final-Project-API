"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificatePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateCertificatePdf = ({ certificate, res, }) => {
    const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=certificate-${certificate.id}.pdf`);
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
        .text(`has successfully completed the skill assessment: "${certificate.assessment.name}"`, { align: "center" });
    doc.moveDown();
    doc
        .fontSize(12)
        .fillColor("#666")
        .text(`Issued on: ${new Date(certificate.issuedAt).toLocaleDateString()}`, {
        align: "center",
    });
    doc.end();
};
exports.generateCertificatePdf = generateCertificatePdf;
