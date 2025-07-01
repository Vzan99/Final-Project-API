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

  const templatePath = path.join(__dirname, "../templates/verifyEmail.hbs");
  const source = fs.readFileSync(templatePath, "utf-8");
  const emailTemplate = handlebars.compile(source);
  const html = emailTemplate({
    name: nameFromEmail,
    verificationLink: `${FE_URL}/auth/verify-email?token=${token}`,
    year: new Date().getFullYear(),
  });

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

  const templatePath = path.join(__dirname, "../templates/verifyEmail.hbs");
  const source = fs.readFileSync(templatePath, "utf-8");
  const emailTemplate = handlebars.compile(source);

  const html = emailTemplate({
    name: param.name,
    verificationLink: `${FE_URL}/auth/verify-email?token=${token}`,
    year: new Date().getFullYear(),
  });

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

export {
  RegisterUserService,
  RegisterAdminService,
  LoginService,
  VerifyEmailService,
  SyncGoogleUserService,
};
