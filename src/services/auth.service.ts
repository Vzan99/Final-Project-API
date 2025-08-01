import {
  IRegisterUserParam,
  IRegisterAdminParam,
  ILoginParam,
} from "../interfaces/user.interface";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { findUserByEmail } from "../helpers/user.helper";
import { FE_URL, SECRET_KEY } from "../config";
import { sendEmail } from "../utils/nodemailer";
import { addHours } from "date-fns";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "../config";

async function RegisterUserService(param: IRegisterUserParam) {
  const isEmailExist = await prisma.user.findUnique({
    where: { email: param.email },
  });

  if (isEmailExist) throw new Error("Email already exists");
  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  const hashedPassword = await bcrypt.hash(param.password, 10);
  const nameFromEmail = param.email.split("@")[0];

  const user = await prisma.user.create({
    data: {
      email: param.email,
      password: hashedPassword,
      name: nameFromEmail,
      role: Role.USER,
      isVerified: false,
    },
  });

  const payload = { userId: user.id, email: user.email };
  const token = sign(payload, SECRET_KEY, { expiresIn: "1h" });

  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: addHours(new Date(), 1),
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
          <a href="${FE_URL}/auth/verify-email?token=${token}" class="verify-btn">Verify My Email</a>
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

  await sendEmail({
    to: param.email,
    subject: "Verify Your Email",
    html,
  });

  return user;
}

async function RegisterAdminService(param: IRegisterAdminParam) {
  const isEmailExist = await findUserByEmail(param.email);
  if (isEmailExist) throw new Error("Email is already exist");
  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  const hashedPassword = await bcrypt.hash(param.password, 10);

  const user = await prisma.user.create({
    data: {
      email: param.email,
      password: hashedPassword,
      phone: param.phone,
      role: Role.ADMIN,
      isVerified: false,
      name: param.name,
    },
  });

  const payload = { userId: user.id, email: user.email };
  const token = sign(payload, SECRET_KEY, { expiresIn: "1h" });

  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: addHours(new Date(), 1),
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
          <a href="${FE_URL}/auth/verify-email?token=${token}" class="verify-btn">Verify My Email</a>
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

  await sendEmail({
    to: param.email,
    subject: "Verify your email (Admin Registration)",
    html,
  });

  return { user };
}

async function LoginService(param: ILoginParam) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: param.email },
    });

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(param.password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    const token = sign(payload, String(SECRET_KEY), { expiresIn: "7d" });

    return {
      user: payload,
      token,
    };
  } catch (err) {
    throw err;
  }
}

async function VerifyEmailService(token: string) {
  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  let decoded: { userId: string; email: string };

  try {
    decoded = verify(token, SECRET_KEY) as { userId: string; email: string };
  } catch {
    throw new Error("Invalid or expired verification token");
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record)
    throw new Error("This verification link is invalid or already used");

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    throw new Error("This verification link has expired");
  }

  if (record.user.isVerified) {
    await prisma.verificationToken.delete({ where: { token } });
    throw new Error("Email already verified");
  }

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { isVerified: true },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return { message: "Email verified successfully" };
}

async function ResendVerificationEmailService(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email already verified");

  const token = sign({ userId: user.id, email: user.email }, SECRET_KEY!, {
    expiresIn: "1h",
  });

  await prisma.verificationToken.upsert({
    where: { userId: user.id },
    update: {
      token,
      expiresAt: addHours(new Date(), 1),
    },
    create: {
      userId: user.id,
      token,
      expiresAt: addHours(new Date(), 1),
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
            <a href="${FE_URL}/auth/verify-email?token=${token}" class="verify-btn">Verify My Email</a>
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

  await sendEmail({
    to: user.email,
    subject: "Resend: Verify Your Email",
    html,
  });

  return { message: "Verification email resent successfully" };
}

async function SyncGoogleUserService(token: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL or Service Role key not configured");
  }

  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new Error("Invalid Supabase token");
  }

  const email = user.email!;
  const name = user.user_metadata.full_name || email.split("@")[0];

  let dbUser = await prisma.user.findUnique({ where: { email } });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email,
        name,
        role: Role.USER,
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

  const jwt = sign(payload, SECRET_KEY, { expiresIn: "7d" });

  return { user: dbUser, token: jwt };
}

async function RequestPasswordResetService(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  if (!user.password) {
    throw new Error(
      "This account was created via Google. Please use Google login."
    );
  }

  const payload = { userId: user.id, email: user.email };
  const token = sign(payload, SECRET_KEY, { expiresIn: "1h" });

  await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    update: {
      token,
      expiresAt: addHours(new Date(), 1),
      createdAt: new Date(),
    },
    create: {
      userId: user.id,
      token,
      expiresAt: addHours(new Date(), 1),
      createdAt: new Date(),
    },
  });

  const resetLink = `${FE_URL}/auth/reset-password?token=${token}`;
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

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
  });

  return { message: "Password reset email sent" };
}

async function ResetPasswordService(token: string, newPassword: string) {
  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  let decoded: { userId: string; email: string };

  try {
    decoded = verify(token, SECRET_KEY) as { userId: string; email: string };
  } catch {
    throw new Error("Invalid or expired password reset token");
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) throw new Error("Invalid or expired password reset token");

  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    throw new Error("Password reset token has expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return { message: "Password has been reset successfully" };
}

async function VerifyNewEmailService(token: string) {
  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  let payload: { userId: string; newEmail: string };
  try {
    payload = verify(token, SECRET_KEY) as any;
  } catch {
    throw new Error("Invalid or expired token");
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!record) throw new Error("Invalid or expired token");
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    throw new Error("Token has expired");
  }

  await prisma.user.update({
    where: { id: payload.userId },
    data: { email: payload.newEmail, isVerified: true },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return { message: "Your email has been updated successfully." };
}

export {
  RegisterUserService,
  RegisterAdminService,
  LoginService,
  VerifyEmailService,
  ResendVerificationEmailService,
  SyncGoogleUserService,
  RequestPasswordResetService,
  ResetPasswordService,
  VerifyNewEmailService,
};
