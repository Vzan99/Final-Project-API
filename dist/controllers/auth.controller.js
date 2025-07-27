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
exports.LogoutController = LogoutController;
exports.RegisterUserController = RegisterUserController;
exports.RegisterAdminController = RegisterAdminController;
exports.LoginController = LoginController;
exports.VerifyEmailController = VerifyEmailController;
exports.ResendVerificationController = ResendVerificationController;
exports.SyncGoogleUserController = SyncGoogleUserController;
exports.RequestPasswordResetController = RequestPasswordResetController;
exports.ResetPasswordController = ResetPasswordController;
exports.VerifyNewEmailController = VerifyNewEmailController;
const auth_service_1 = require("../services/auth.service");
function RegisterUserController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new Error("Missing required fields"));
        }
        try {
            const user = yield (0, auth_service_1.RegisterUserService)({
                email,
                password,
            });
            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function RegisterAdminController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password, name, phone } = req.body;
        if (!email || !password || !name || !phone) {
            return next(new Error("Missing required fields"));
        }
        try {
            const { user } = yield (0, auth_service_1.RegisterAdminService)({
                email,
                password,
                name,
                phone,
            });
            res.status(201).json({
                message: "Company admin registered successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function LoginController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new Error("Missing email or password"));
        }
        const isProd = process.env.NODE_ENV === "production";
        try {
            const { user, token } = yield (0, auth_service_1.LoginService)({ email, password });
            res
                .status(200)
                .cookie("access_token", token, {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? "none" : "lax",
                path: "/",
                maxAge: 24 * 60 * 60 * 1000,
            })
                .json({
                message: "Login successful",
                user,
                token,
            });
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function LogoutController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const isProd = process.env.NODE_ENV === "production";
        try {
            res.clearCookie("access_token", {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? "none" : "lax",
                path: "/",
            });
            res.status(200).json({ message: "Logout successful" });
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function VerifyEmailController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.validatedQuery.token;
            const result = yield (0, auth_service_1.VerifyEmailService)(token);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function ResendVerificationController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId)
                return next(new Error("Unauthorized"));
            const result = yield (0, auth_service_1.ResendVerificationEmailService)(userId);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function SyncGoogleUserController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers.authorization;
            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
                throw new Error("Missing or invalid Authorization header");
            }
            const token = authHeader.split(" ")[1];
            const { user, token: jwtToken } = yield (0, auth_service_1.SyncGoogleUserService)(token);
            const isProd = process.env.NODE_ENV === "production";
            res.cookie("access_token", jwtToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: isProd ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({ message: "User synced", user });
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function RequestPasswordResetController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.body;
        if (!email)
            throw new Error("Email is Required");
        try {
            const result = yield (0, auth_service_1.RequestPasswordResetService)(email);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function ResetPasswordController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token, newPassword } = req.body;
        if (!token || !newPassword)
            throw new Error("Token and new password is Required");
        try {
            const result = yield (0, auth_service_1.ResetPasswordService)(token, newPassword);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message || "Something went wrong" });
        }
    });
}
function VerifyNewEmailController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.query.token;
        if (!token)
            throw new Error("Token is Required");
        try {
            const result = yield (0, auth_service_1.VerifyNewEmailService)(token);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
