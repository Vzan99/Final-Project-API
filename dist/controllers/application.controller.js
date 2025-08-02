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
exports.getApplicantsByJobHandler = getApplicantsByJobHandler;
exports.getApplicationDetailHandler = getApplicationDetailHandler;
exports.updateApplicationStatusHandler = updateApplicationStatusHandler;
exports.checkApplicationStatusHandler = checkApplicationStatusHandler;
exports.getUserApplicationsController = getUserApplicationsController;
exports.postFeedbackController = postFeedbackController;
const application_service_1 = require("../services/application.service");
function getApplicantsByJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const jobId = req.params.jobId;
            const applicants = yield (0, application_service_1.getApplicantsByJob)(jobId, adminId);
            res.status(200).json({
                success: true,
                data: applicants,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getApplicationDetailHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const applicationId = req.params.id;
            const adminId = req.user.id;
            const detail = yield (0, application_service_1.getApplicationDetail)(applicationId, adminId);
            res.status(200).json({
                success: true,
                data: detail,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function updateApplicationStatusHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const applicationId = req.params.id;
            const data = req.body;
            const updated = yield (0, application_service_1.updateApplicationStatus)(applicationId, adminId, data);
            res.status(200).json({
                success: true,
                message: "Application status updated",
                data: updated,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function checkApplicationStatusHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const jobId = req.params.jobId;
            const hasApplied = yield (0, application_service_1.checkIfUserApplied)(jobId, userId);
            res.status(200).json({ success: true, applied: hasApplied });
        }
        catch (err) {
            next(err);
        }
    });
}
function getUserApplicationsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId)
                throw new Error("User not authenticated");
            const { page, pageSize, status } = req
                .validatedQuery;
            const result = yield (0, application_service_1.getUserApplicationService)(userId, page, pageSize, status);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    });
}
function postFeedbackController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const applicationId = req.params.id;
            const { feedback } = req.body;
            if (typeof feedback !== "string" || feedback.trim() === "") {
                throw new Error("Feedback must be a non-empty string");
            }
            const result = yield (0, application_service_1.submitApplicationFeedback)(applicationId, feedback);
            res
                .status(200)
                .json({ message: "Feedback submitted", application: result });
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
