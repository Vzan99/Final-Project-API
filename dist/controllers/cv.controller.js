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
        return `• ${exp.title} at ${exp.companyName} (${start} - ${end})\n${exp.description || ""}`;
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
});
exports.getCVFormData = getCVFormData;
const generateCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name, email, phone, about, experience, education, extraSkills = [], projects = [], } = req.body;
    const doc = new pdfkit_1.default();
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
        projects.forEach((p) => {
            doc.fontSize(12).text(`• ${p.name}: ${p.desc}`);
        });
    }
    else {
        doc.fontSize(12).text("-");
    }
    doc.end();
});
exports.generateCV = generateCV;
