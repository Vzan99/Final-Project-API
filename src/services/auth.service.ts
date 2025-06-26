import {
  IRegisterUserParam,
  IRegisterAdminParam,
  ILoginParam,
} from "../interfaces/user.interface";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { findUserByEmail } from "../helpers/user.helper";
import { FE_URL, SECRET_KEY } from "../config";
import { sendEmail } from "../utils/nodemailer";
import { addHours } from "date-fns";

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

  await sendEmail({
    to: param.email,
    subject: "Verify Your Email",
    html: `
      <p>Hi ${nameFromEmail},</p>
      <p>Please verify your email:</p>
      <a href="${FE_URL}/auth/verify-email?token=${token}" target="_blank">Verify My Email</a>
    `,
  });

  return user;
}

async function RegisterAdminService(param: IRegisterAdminParam) {
  try {
    const isEmailExist = await findUserByEmail(param.email);
    if (isEmailExist) throw new Error("Email is already exist");

    if (!SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }

    const hashedPassword = await bcrypt.hash(param.password, 10);

    const token = sign(
      { email: param.email, name: param.name, role: Role.ADMIN },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    await sendEmail({
      to: param.email,
      subject: "Verify your email (Admin Registration)",
      html: `
        <p>Hi ${param.name},</p>
        <p>Thanks for registering your company with Precise. Please verify your email by clicking the link below:</p>
        <a href="${FE_URL}/auth/verify-email?token=${token}" target="_blank">Verify My Email</a>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this message.</p>
      `,
    });

    const user = await prisma.user.create({
      data: {
        email: param.email,
        password: hashedPassword,
        role: Role.ADMIN,
        isVerified: false,
        name: param.name,
      },
    });

    return { user };
  } catch (err) {
    throw err;
  }
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

export {
  RegisterUserService,
  RegisterAdminService,
  LoginService,
  VerifyEmailService,
};
