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
exports.generateAndSaveCertificatePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generateAndSaveCertificatePdf = (_a) => __awaiter(void 0, [_a], void 0, function* ({ certificate, }) {
    const dir = path_1.default.join(__dirname, "../../public/certificates");
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    const filePath = path_1.default.join(dir, `${certificate.id}.pdf`);
    const stream = fs_1.default.createWriteStream(filePath);
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
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
            .text(`has successfully completed the skill assessment: "${certificate.assessment.name}"`, { align: "center" })
            .moveDown();
        doc
            .fontSize(12)
            .fillColor("#666")
            .text(`Issued on: ${new Date(certificate.issuedAt).toLocaleDateString()}`, { align: "center" });
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
});
exports.generateAndSaveCertificatePdf = generateAndSaveCertificatePdf;
