import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { FE_URL, SECRET_KEY } from "../config";
import { addHours } from "date-fns";
import { sendEmail } from "../utils/nodemailer";

async function GetProfileService(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        profile: {
          select: {
            birthDate: true,
            gender: true,
            education: true,
            address: true,
            photoUrl: true,
            resumeUrl: true,
            skills: true,
          },
        },
        certificates: {
          select: {
            id: true,
            certificateUrl: true,
            verificationCode: true,
            issuedAt: true,
            expiresAt: true,
          },
        },
        subscriptions: {
          where: {
            paymentStatus: "PAID",
            isApproved: true,
          },
          orderBy: {
            startDate: "desc",
          },
          take: 1,
          select: {
            type: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const sub = user.subscriptions?.[0];
    const subscription = sub
      ? {
          status: now > sub.endDate ? "INACTIVE" : "ACTIVE",
          type: sub.type,
          startDate: sub.startDate,
          endDate: sub.endDate,
        }
      : undefined;

    return {
      ...user,
      subscription,
    };
  } catch (err) {
    throw err;
  }
}

async function ChangePasswordService(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    throw new Error("User not found or social login user");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
}

async function ChangeEmailService(
  userId: string,
  newEmail: string,
  currentPassword: string
) {
  if (!SECRET_KEY) throw new Error("Missing SECRET_KEY");

  // 1) Fetch user & verify password
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password)
    throw new Error("User not found or social login user");

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error("Current password is incorrect");

  // 2) Validate & normalize newEmail
  const normalized = newEmail.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    throw new Error("Invalid email address");

  const already = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (already) throw new Error("Email is already in use");

  // 3) Issue a JWT containing the new email
  const token = sign({ userId, newEmail: normalized }, SECRET_KEY, {
    expiresIn: "1h",
  });

  // 4) Persist in VerificationToken
  await prisma.verificationToken.upsert({
    where: { userId },
    update: { token, expiresAt: addHours(new Date(), 1) },
    create: { userId, token, expiresAt: addHours(new Date(), 1) },
  });

  // 5) Send verification email
  const source = fs.readFileSync(
    path.join(__dirname, "../templates/changeEmail.hbs"),
    "utf-8"
  );
  const tpl = handlebars.compile(source);
  const html = tpl({
    name: user.name || user.email.split("@")[0],
    verificationLink: `${FE_URL}/auth/verify-new-email?token=${token}`,
    year: new Date().getFullYear(),
  });

  await sendEmail({
    to: normalized,
    subject: "Verify Your New Email Address",
    html,
  });

  return { message: "Verification link sent to your new email." };
}



export {
  GetProfileService,
  ChangePasswordService,
  ChangeEmailService,
};
