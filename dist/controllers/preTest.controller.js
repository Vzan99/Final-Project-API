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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreSelectionTestHandler = createPreSelectionTestHandler;
exports.updatePreSelectionTestHandler = updatePreSelectionTestHandler;
exports.getPreSelectionTestByJobHandler = getPreSelectionTestByJobHandler;
exports.getPreSelectionTestByAdminHandler = getPreSelectionTestByAdminHandler;
exports.submitPreSelectionAnswerHandler = submitPreSelectionAnswerHandler;
exports.getApplicantsWithTestResultHandler = getApplicantsWithTestResultHandler;
exports.getPreSelectionStatusHandler = getPreSelectionStatusHandler;
const preTest_service_1 = require("../services/preTest.service");
function createPreSelectionTestHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newTest = yield (0, preTest_service_1.createPreSelectionTest)(req.body);
            res.status(201).json({ success: true, data: newTest });
        }
        catch (err) {
            next(err);
        }
    });
}
function updatePreSelectionTestHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.jobId;
            const body = req.body;
            const result = yield (0, preTest_service_1.updatePreSelectionTest)(jobId, body);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getPreSelectionTestByJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { jobId } = req.params;
            const test = yield (0, preTest_service_1.getPreSelectionTestByJob)(jobId);
            res.status(200).json({ success: true, data: test });
        }
        catch (err) {
            next(err);
        }
    });
}
function getPreSelectionTestByAdminHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { jobId } = req.params;
            const adminId = req.user.id;
            const data = yield (0, preTest_service_1.getPreSelectionTestDetailByAdmin)(jobId, adminId);
            res.json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    });
}
function submitPreSelectionAnswerHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.jobId;
            const userId = req.user.id;
            const result = yield (0, preTest_service_1.submitPreSelectionAnswer)(jobId, userId, req.body);
            res.status(201).json({
                success: true,
                message: "Test submitted successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getApplicantsWithTestResultHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.jobId;
            const result = yield (0, preTest_service_1.getApplicantsWithTestResult)(jobId);
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    });
}
function getPreSelectionStatusHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.jobId;
            const userId = req.user.id;
            const result = yield (0, preTest_service_1.checkPreSelectionStatus)(jobId, userId);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    });
}
