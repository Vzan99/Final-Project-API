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
exports.RegisterUserService = RegisterUserService;
exports.RegisterAdminService = RegisterAdminService;
exports.LoginService = LoginService;
exports.VerifyEmailService = VerifyEmailService;
exports.ResendVerificationEmailService = ResendVerificationEmailService;
exports.SyncGoogleUserService = SyncGoogleUserService;
exports.RequestPasswordResetService = RequestPasswordResetService;
exports.ResetPasswordService = ResetPasswordService;
exports.VerifyNewEmailService = VerifyNewEmailService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = require("jsonwebtoken");
const user_helper_1 = require("../helpers/user.helper");
const config_1 = require("../config");
const nodemailer_1 = require("../utils/nodemailer");
const date_fns_1 = require("date-fns");
const supabase_js_1 = require("@supabase/supabase-js");
const config_2 = require("../config");
function RegisterUserService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        const isEmailExist = yield prisma_1.default.user.findUnique({
            where: { email: param.email },
        });
        if (isEmailExist)
            throw new Error("Email already exists");
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        const hashedPassword = yield bcryptjs_1.default.hash(param.password, 10);
        const nameFromEmail = param.email.split("@")[0];
        const user = yield prisma_1.default.user.create({
            data: {
                email: param.email,
                password: hashedPassword,
                name: nameFromEmail,
                role: client_1.Role.USER,
                isVerified: false,
            },
        });
        const payload = { userId: user.id, email: user.email };
        const token = (0, jsonwebtoken_1.sign)(payload, config_1.SECRET_KEY, { expiresIn: "1h" });
        yield prisma_1.default.verificationToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt: (0, date_fns_1.addHours)(new Date(), 1),
            },
        });
        const html = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
      body { background-color: #f1f0e8; font-family: Arial, sans-serif; margin: 0; padding: 0; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: #89a8b2; padding: 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { padding: 30px 20px; color: #333333; background-color: #f1f0e8; }
      .content h2 { font-size: 20px; margin-bottom: 10px; }
      .content p { font-size: 16px; line-height: 1.6; }
      .btn-container { text-align: center; margin: 30px 0; }
      .verify-btn { background-color: #89a8b2; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; display: inline-block; font-weight: bold; }
      .footer { font-size: 12px; color: #999999; text-align: center; padding: 20px; background-color: #ffffff; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Email Verification</h1>
      </div>
      <div class="content">
        <h2>Hello ${nameFromEmail},</h2>
        <p>Thank you for signing up with Precise. To complete your registration, please verify your email by clicking the button below.</p>
        <div class="btn-container">
          <a href="${config_1.FE_URL}/auth/verify-email?token=${token}" class="verify-btn">Verify My Email</a>
        </div>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Precise. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
        yield (0, nodemailer_1.sendEmail)({
            to: param.email,
            subject: "Verify Your Email",
            html,
        });
        return user;
    });
}
function RegisterAdminService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        const isEmailExist = yield (0, user_helper_1.findUserByEmail)(param.email);
        if (isEmailExist)
            throw new Error("Email is already exist");
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        const hashedPassword = yield bcryptjs_1.default.hash(param.password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                email: param.email,
                password: hashedPassword,
                phone: param.phone,
                role: client_1.Role.ADMIN,
                isVerified: false,
                name: param.name,
            },
        });
        const payload = { userId: user.id, email: user.email };
        const token = (0, jsonwebtoken_1.sign)(payload, config_1.SECRET_KEY, { expiresIn: "1h" });
        yield prisma_1.default.verificationToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt: (0, date_fns_1.addHours)(new Date(), 1),
            },
        });
        const html = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
      body { background-color: #f1f0e8; font-family: Arial, sans-serif; margin: 0; padding: 0; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: #89a8b2; padding: 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { padding: 30px 20px; color: #333333; background-color: #f1f0e8; }
      .content h2 { font-size: 20px; margin-bottom: 10px; }
      .content p { font-size: 16px; line-height: 1.6; }
      .btn-container { text-align: center; margin: 30px 0; }
      .verify-btn { background-color: #89a8b2; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; display: inline-block; font-weight: bold; }
      .footer { font-size: 12px; color: #999999; text-align: center; padding: 20px; background-color: #ffffff; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Email Verification</h1>
      </div>
      <div class="content">
        <h2>Hello ${param.name},</h2>
        <p>Thank you for signing up with Precise. To complete your registration, please verify your email by clicking the button below.</p>
        <div class="btn-container">
          <a href="${config_1.FE_URL}/auth/verify-email?token=${token}" class="verify-btn">Verify My Email</a>
        </div>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Precise. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
        yield (0, nodemailer_1.sendEmail)({
            to: param.email,
            subject: "Verify your email (Admin Registration)",
            html,
        });
        return { user };
    });
}
function LoginService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { email: param.email },
            });
            if (!user || !user.password) {
                throw new Error("Invalid email or password");
            }
            const isMatch = yield bcryptjs_1.default.compare(param.password, user.password);
            if (!isMatch)
                throw new Error("Invalid email or password");
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            };
            const token = (0, jsonwebtoken_1.sign)(payload, String(config_1.SECRET_KEY), { expiresIn: "7d" });
            return {
                user: payload,
                token,
            };
        }
        catch (err) {
            throw err;
        }
    });
}
function VerifyEmailService(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        let decoded;
        try {
            decoded = (0, jsonwebtoken_1.verify)(token, config_1.SECRET_KEY);
        }
        catch (_a) {
            throw new Error("Invalid or expired verification token");
        }
        const record = yield prisma_1.default.verificationToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!record)
            throw new Error("This verification link is invalid or already used");
        if (record.expiresAt < new Date()) {
            yield prisma_1.default.verificationToken.delete({ where: { token } });
            throw new Error("This verification link has expired");
        }
        if (record.user.isVerified) {
            yield prisma_1.default.verificationToken.delete({ where: { token } });
            throw new Error("Email already verified");
        }
        yield prisma_1.default.user.update({
            where: { id: decoded.userId },
            data: { isVerified: true },
        });
        yield prisma_1.default.verificationToken.delete({ where: { token } });
        return { message: "Email verified successfully" };
    });
}
function ResendVerificationEmailService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("User not found");
        if (user.isVerified)
            throw new Error("Email already verified");
        const token = (0, jsonwebtoken_1.sign)({ userId: user.id, email: user.email }, config_1.SECRET_KEY, {
            expiresIn: "1h",
        });
        yield prisma_1.default.verificationToken.upsert({
            where: { userId: user.id },
            update: {
                token,
                expiresAt: (0, date_fns_1.addHours)(new Date(), 1),
            },
            create: {
                userId: user.id,
                token,
                expiresAt: (0, date_fns_1.addHours)(new Date(), 1),
            },
        });
        const name = user.name || user.email.split("@")[0];
        const html = `
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Email Verification</title>
      <style>
        body { background-color: #f1f0e8; font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
        .header { background-color: #89a8b2; padding: 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; color: #333333; background-color: #f1f0e8; }
        .content h2 { font-size: 20px; margin-bottom: 10px; }
        .content p { font-size: 16px; line-height: 1.6; }
        .btn-container { text-align: center; margin: 30px 0; }
        .verify-btn { background-color: #89a8b2; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; display: inline-block; font-weight: bold; }
        .footer { font-size: 12px; color: #999999; text-align: center; padding: 20px; background-color: #ffffff; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for signing up with Precise. To complete your registration, please verify your email by clicking the button below.</p>
          <div class="btn-container">
            <a href="${config_1.FE_URL}/auth/verify-email?token=${token}" class="verify-btn">Verify My Email</a>
          </div>
          <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Precise. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
        yield (0, nodemailer_1.sendEmail)({
            to: user.email,
            subject: "Resend: Verify Your Email",
            html,
        });
        return { message: "Verification email resent successfully" };
    });
}
function SyncGoogleUserService(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_2.SUPABASE_URL || !config_2.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Supabase URL or Service Role key not configured");
        }
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        const supabaseAdmin = (0, supabase_js_1.createClient)(config_2.SUPABASE_URL, config_2.SUPABASE_SERVICE_ROLE_KEY);
        const { data: { user }, error, } = yield supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            throw new Error("Invalid Supabase token");
        }
        const email = user.email;
        const name = user.user_metadata.full_name || email.split("@")[0];
        let dbUser = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!dbUser) {
            dbUser = yield prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    role: client_1.Role.USER,
                    isVerified: true,
                },
            });
        }
        const payload = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
        };
        const jwt = (0, jsonwebtoken_1.sign)(payload, config_1.SECRET_KEY, { expiresIn: "7d" });
        return { user: dbUser, token: jwt };
    });
}
function RequestPasswordResetService(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("User not found");
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        if (!user.password) {
            throw new Error("This account was created via Google. Please use Google login.");
        }
        const payload = { userId: user.id, email: user.email };
        const token = (0, jsonwebtoken_1.sign)(payload, config_1.SECRET_KEY, { expiresIn: "1h" });
        yield prisma_1.default.passwordResetToken.upsert({
            where: { userId: user.id },
            update: {
                token,
                expiresAt: (0, date_fns_1.addHours)(new Date(), 1),
                createdAt: new Date(),
            },
            create: {
                userId: user.id,
                token,
                expiresAt: (0, date_fns_1.addHours)(new Date(), 1),
                createdAt: new Date(),
            },
        });
        const resetLink = `${config_1.FE_URL}/auth/reset-password?token=${token}`;
        const name = user.name || user.email.split("@")[0];
        const year = new Date().getFullYear();
        const html = `
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Password Reset</title>
        <style>
          body { background-color: #f1f0e8; font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
          .header { background-color: #89a8b2; padding: 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; color: #333333; background-color: #f1f0e8; }
          .content h2 { font-size: 20px; margin-bottom: 10px; }
          .content p { font-size: 16px; line-height: 1.6; }
          .btn-container { text-align: center; margin: 30px 0; }
          .reset-btn { background-color: #89a8b2; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; display: inline-block; font-weight: bold; }
          .footer { font-size: 12px; color: #999999; text-align: center; padding: 20px; background-color: #ffffff; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>

          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Click the button below to proceed:</p>

            <div class="btn-container">
              <a href="${resetLink}" class="reset-btn">Reset My Password</a>
            </div>

            <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          </div>

          <div class="footer">
            &copy; ${year} Precise. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
        yield (0, nodemailer_1.sendEmail)({
            to: email,
            subject: "Reset Your Password",
            html,
        });
        return { message: "Password reset email sent" };
    });
}
function ResetPasswordService(token, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        let decoded;
        try {
            decoded = (0, jsonwebtoken_1.verify)(token, config_1.SECRET_KEY);
        }
        catch (_a) {
            throw new Error("Invalid or expired password reset token");
        }
        const record = yield prisma_1.default.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!record)
            throw new Error("Invalid or expired password reset token");
        if (record.expiresAt < new Date()) {
            yield prisma_1.default.passwordResetToken.delete({ where: { token } });
            throw new Error("Password reset token has expired");
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma_1.default.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword },
        });
        yield prisma_1.default.passwordResetToken.delete({ where: { token } });
        return { message: "Password has been reset successfully" };
    });
}
function VerifyNewEmailService(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        let payload;
        try {
            payload = (0, jsonwebtoken_1.verify)(token, config_1.SECRET_KEY);
        }
        catch (_a) {
            throw new Error("Invalid or expired token");
        }
        const record = yield prisma_1.default.verificationToken.findUnique({
            where: { token },
        });
        if (!record)
            throw new Error("Invalid or expired token");
        if (record.expiresAt < new Date()) {
            yield prisma_1.default.verificationToken.delete({ where: { token } });
            throw new Error("Token has expired");
        }
        yield prisma_1.default.user.update({
            where: { id: payload.userId },
            data: { email: payload.newEmail, isVerified: true },
        });
        yield prisma_1.default.verificationToken.delete({ where: { token } });
        return { message: "Your email has been updated successfully." };
    });
}
