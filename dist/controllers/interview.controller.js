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
exports.createInterviewHandler = createInterviewHandler;
exports.getAllInterviewsByAdminHandler = getAllInterviewsByAdminHandler;
exports.getInterviewsByJobHandler = getInterviewsByJobHandler;
exports.updateInterviewHandler = updateInterviewHandler;
exports.deleteInterviewHandler = deleteInterviewHandler;
exports.updateInterviewStatusHandler = updateInterviewStatusHandler;
const interview_service_1 = require("../services/interview.service");
function createInterviewHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const data = req.body;
            const result = yield (0, interview_service_1.createInterview)(adminId, data);
            res.status(201).json({
                success: true,
                message: "Interview scheduled successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getAllInterviewsByAdminHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            // Kirimkan query ke service
            const interviews = yield (0, interview_service_1.getAllInterviewsByAdmin)(adminId, req.query);
            res.json(Object.assign({ success: true }, interviews));
        }
        catch (err) {
            next(err);
        }
    });
}
function getInterviewsByJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.query.jobId;
            const adminId = req.user.id;
            if (!jobId) {
                res.status(400).json({ message: "jobId is required" });
                return;
            }
            const result = yield (0, interview_service_1.getInterviewsByJob)(jobId, adminId);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    });
}
function updateInterviewHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const interviewId = req.params.id;
            const data = req.body;
            const updated = yield (0, interview_service_1.updateInterviewById)(interviewId, adminId, data);
            res.status(200).json({
                success: true,
                message: "Interview updated",
                data: updated,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function deleteInterviewHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const interviewId = req.params.id;
            const result = yield (0, interview_service_1.deleteInterviewById)(interviewId, adminId);
            res.status(200).json({
                success: true,
                message: "Interview deleted successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function updateInterviewStatusHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const interviewId = req.params.id;
            const { status } = req.body;
            if (!["COMPLETED", "CANCELLED", "RESCHEDULED"].includes(status)) {
                res.status(400).json({ message: "Invalid status value" });
                return;
            }
            const result = yield (0, interview_service_1.updateInterviewStatus)(interviewId, adminId, status);
            res.status(200).json({
                success: true,
                message: "Interview status updated successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
