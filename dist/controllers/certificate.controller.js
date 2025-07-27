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
exports.downloadCertificatePdf = exports.verifyCertificateHandler = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const asyncHandler_1 = require("../utils/asyncHandler");
const generateCertificatePDF_1 = require("../utils/generateCertificatePDF");
exports.verifyCertificateHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.params;
    const cert = yield prisma_1.default.certificate.findFirst({
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
}));
exports.downloadCertificatePdf = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cert = yield prisma_1.default.certificate.findUnique({
        where: { id },
        include: {
            user: { select: { name: true } },
            assessment: { select: { name: true } },
        },
    });
    if (!cert) {
        return res.status(404).json({ message: "Certificate not found" });
    }
    (0, generateCertificatePDF_1.generateCertificatePdf)({ certificate: cert, res });
}));
