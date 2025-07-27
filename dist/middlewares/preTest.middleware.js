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
exports.VerifyPreSelectionPassed = VerifyPreSelectionPassed;
const prisma_1 = __importDefault(require("../lib/prisma"));
function VerifyPreSelectionPassed(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const { jobId } = req.body;
            if (!jobId) {
                return res.status(400).json({ message: "jobId is required" });
            }
            const job = yield prisma_1.default.job.findUnique({
                where: { id: jobId },
                include: { preSelectionTest: true },
            });
            if (!job) {
                return res.status(404).json({ message: "Job not found" });
            }
            if (!job.hasTest || !job.preSelectionTest) {
                // Tidak punya test → langsung lanjut
                return next();
            }
            const test = job.preSelectionTest;
            const answer = yield prisma_1.default.preSelectionAnswer.findUnique({
                where: {
                    userId_testId: {
                        userId,
                        testId: test.id,
                    },
                },
            });
            if (!answer) {
                return res
                    .status(403)
                    .json({ message: "You must complete the pre-selection test first." });
            }
            if (!answer.passed) {
                return res
                    .status(403)
                    .json({ message: "You did not pass the pre-selection test." });
            }
            // Passed
            next();
        }
        catch (err) {
            next(err);
        }
    });
}
