import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { FE_URL, SECRET_KEY } from "../config";
import { addHours } from "date-fns";
import { sendEmail } from "../utils/nodemailer";
import { IUpdateProfileInput } from "../interfaces/profile.interface";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";

async function GetProfileService(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
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
            about: true,
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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password)
    throw new Error("User not found or social login user");

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error("Current password is incorrect");

  const normalized = newEmail.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    throw new Error("Invalid email address");

  const already = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (already) throw new Error("Email is already in use");

  const token = sign({ userId, newEmail: normalized }, SECRET_KEY, {
    expiresIn: "1h",
  });

  await prisma.verificationToken.upsert({
    where: { userId },
    update: { token, expiresAt: addHours(new Date(), 1) },
    create: { userId, token, expiresAt: addHours(new Date(), 1) },
  });

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

async function UpdateUserProfileService(input: IUpdateProfileInput) {
  const {
    userId,
    name,
    phone,
    birthDate,
    gender,
    education,
    address,
    skills,
    about,
  } = input;

  function removeUndefined<T extends object>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as Partial<T>);
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: removeUndefined({
        name,
        phone,
      }),
    });

    const profileUpdateData = removeUndefined({
      birthDate: birthDate ? new Date(birthDate) : undefined,
      gender,
      education,
      address,
      skills,
      about,
    });

    const profileCreateData = {
      userId,
      birthDate: birthDate ? new Date(birthDate) : new Date(),
      gender: gender || "",
      education: education || "",
      address: address || "",
      skills: skills || [],
      about: about || null,
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileUpdateData,
      create: profileCreateData,
    });

    return profile;
  } catch (error) {
    throw new Error("Failed to update profile: " + (error as Error).message);
  }
}

async function UpdateProfilePhotoService(
  userId: string,
  file: Express.Multer.File
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: { select: { photoUrl: true } },
      },
    });

    const oldPhoto = user?.profile?.photoUrl;

    const uploadRes = await cloudinaryUpload(file);

    const fullFilename = `${uploadRes.public_id}.${uploadRes.format}`;

    if (oldPhoto) {
      const oldPublicId = oldPhoto.split(".")[0];
      await cloudinaryRemove(oldPublicId);
    }

    await prisma.profile.update({
      where: { userId },
      data: { photoUrl: fullFilename },
    });

    return { message: "Photo updated successfully", filename: fullFilename };
  } catch (err) {
    throw new Error(
      "Failed to update profile photo: " + (err as Error).message
    );
  }
}

async function UpdateResumeService(userId: string, file: Express.Multer.File) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: { select: { resumeUrl: true } },
      },
    });

    const oldResume = user?.profile?.resumeUrl;

    const uploadRes = await cloudinaryUpload(file, "raw");

    const ext = path.extname(file.originalname);
    const fullFilename = `${uploadRes.public_id}${ext}`;

    if (oldResume) {
      const oldPublicId = oldResume.split(".")[0];
      await cloudinaryRemove(oldPublicId);
    }

    await prisma.profile.update({
      where: { userId },
      data: { resumeUrl: fullFilename },
    });

    return { message: "Resume uploaded successfully", filename: fullFilename };
  } catch (err) {
    throw new Error("Failed to update resume: " + (err as Error).message);
  }
}

export {
  GetProfileService,
  ChangePasswordService,
  ChangeEmailService,
  UpdateUserProfileService,
  UpdateProfilePhotoService,
  UpdateResumeService,
};
