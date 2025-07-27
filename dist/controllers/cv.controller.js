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
exports.generateCV = exports.getCVFormData = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const getCVFormData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    });
    if (!user || !user.profile) {
        res.status(404).json({ message: "User profile not found" });
        return;
    }
    res.json(Object.assign({ name: user.name, email: user.email }, user.profile));
});
exports.getCVFormData = getCVFormData;
const generateCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { summary, extraSkills = [], projects = [] } = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    });
    if (!user || !user.profile) {
        res.status(404).json({ message: "User profile not found" });
        return;
    }
    const doc = new pdfkit_1.default();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=cv.pdf");
    doc.pipe(res); // Pipe dulu sebelum isi konten
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
        projects.forEach((p) => {
            doc.fontSize(12).text(`• ${p.name}: ${p.desc}`);
        });
    }
    else {
        doc.fontSize(12).text("-");
    }
    doc.end(); //
});
exports.generateCV = generateCV;
