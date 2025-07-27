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
exports.GetProfileController = GetProfileController;
exports.ChangePasswordController = ChangePasswordController;
exports.ChangeEmailController = ChangeEmailController;
exports.UpdateProfileController = UpdateProfileController;
exports.UpdateProfilePhotoController = UpdateProfilePhotoController;
exports.UpdateResumeController = UpdateResumeController;
exports.UpdateBannerController = UpdateBannerController;
exports.UpdateExperiencesController = UpdateExperiencesController;
exports.UpdateCompanyProfileController = UpdateCompanyProfileController;
const profile_service_1 = require("../services/profile.service");
function GetProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user)
                throw new Error("Unauthorized");
            const profile = yield (0, profile_service_1.GetProfileService)(req.user.id);
            res.status(200).json({
                message: "Profile fetched successfully",
                data: profile,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function ChangePasswordController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return next(new Error("Unauthorized"));
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return next(new Error("Current and new password are required"));
        try {
            const result = yield (0, profile_service_1.ChangePasswordService)(userId, currentPassword, newPassword);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function ChangeEmailController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { newEmail, password } = req.body;
        if (!userId)
            throw new Error("Unauthorized");
        if (!newEmail || !password)
            throw new Error("New email and password is Required");
        try {
            const result = yield (0, profile_service_1.ChangeEmailService)(userId, newEmail, password);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function UpdateProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user)
                throw new Error("Unauthorized");
            const input = Object.assign({ userId: req.user.id }, req.body);
            const updatedProfile = yield (0, profile_service_1.UpdateUserProfileService)(input);
            res.status(200).json({
                message: "Profile updated successfully",
                data: updatedProfile,
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function UpdateProfilePhotoController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const file = req.file;
            if (!userId || !file)
                throw new Error("User ID and photo file are required");
            const result = yield (0, profile_service_1.UpdateProfilePhotoService)(userId, file);
            res.status(200).json({
                message: result.message,
                filename: result.filename,
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function UpdateResumeController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const file = req.file;
            if (!userId || !file)
                throw new Error("User ID and resume file are required");
            const result = yield (0, profile_service_1.UpdateResumeService)(userId, file);
            res.status(200).json({
                message: result.message,
                filename: result.filename,
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function UpdateBannerController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
            const file = req.file;
            if (!userId || !role || !file)
                throw new Error("User ID, role, and banner file are required");
            const result = yield (0, profile_service_1.UpdateBannerService)(userId, role, file);
            res.status(200).json({
                message: result.message,
                filename: result.filename,
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function UpdateExperiencesController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId)
                throw new Error("Unauthorized");
            const { experiences } = req.body;
            const updated = yield (0, profile_service_1.UpdateExperiencesService)(userId, experiences);
            res.status(200).json({
                message: "Experiences updated successfully",
                data: updated,
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function UpdateCompanyProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId)
                throw new Error("Unauthorized");
            const company = yield (0, profile_service_1.UpdateCompanyProfileService)(userId, req.body);
            res.status(200).json({
                message: "Company profile updated successfully",
                data: company,
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
