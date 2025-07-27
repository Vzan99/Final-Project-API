"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.RequestPasswordResetSchema = exports.VerifyEmailSchema = exports.LoginSchema = exports.RegisterAdminSchema = exports.RegisterUserSchema = void 0;
const zod_1 = require("zod");
exports.RegisterUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").trim(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .nonempty("Password is required"),
});
exports.RegisterAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").trim(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .nonempty("Password is required"),
    name: zod_1.z.string().min(2, "Company name is at least 2 letters").trim(),
    phone: zod_1.z
        .string()
        .min(6, "Phone number is required")
        .max(20)
        .regex(/^[\d\s()+-]+$/, "Phone number format is invalid")
        .trim(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("invalid email format").trim(),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.VerifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
});
exports.RequestPasswordResetSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").trim(),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
    newPassword: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .nonempty("New password is required"),
});
