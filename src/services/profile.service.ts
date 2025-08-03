import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { FE_URL, SECRET_KEY } from "../config";
import { addHours } from "date-fns";
import { sendEmail } from "../utils/nodemailer";
import {
  IUpdateProfileInput,
  IExperienceInput,
} from "../interfaces/profile.interface";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";
import { EmploymentType, LocationType } from "@prisma/client";

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
          include: {
            experiences: true,
          },
        },
        company: true,
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
        assessments: {
          select: {
            id: true,
            badge: true,
            assessment: {
              select: { name: true },
            },
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

    const baseResponse: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      certificates: user.certificates,
      subscription,
      assessments: user.assessments,
    };

    if (user.role === "USER") {
      baseResponse.profile = user.profile;
    } else if (user.role === "ADMIN") {
      baseResponse.company = user.company;
    }

    return baseResponse;
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

  const name = user.name || user.email.split("@")[0];
  const verificationLink = `${FE_URL}/auth/verify-new-email?token=${token}`;
  const year = new Date().getFullYear();

  const html = `
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Email Change Verification</title>
        <style>
          body { background-color: #f1f0e8; font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
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
            <h1>Email Change Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>
              We received a request to change the email address for your account.
              Please click the button below to verify your new email address:
            </p>
            <div class="btn-container">
              <a href="${verificationLink}" class="verify-btn">Verify My Email</a>
            </div>
            <p>
              This link will expire in 1 hour. If you did not request this change,
              please ignore this email or contact support.
            </p>
          </div>
          <div class="footer">
            &copy; ${year} Precise. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

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
        role: true,
        profile: { select: { photoUrl: true } },
        company: { select: { logo: true } },
      },
    });

    if (!user) throw new Error("User not found");

    const uploadRes = await cloudinaryUpload(file);
    const fullFilename = `${uploadRes.public_id}.${uploadRes.format}`;

    if (user.role === "USER") {
      const oldPhoto = user.profile?.photoUrl;
      if (oldPhoto) {
        const oldPublicId = oldPhoto.split(".")[0];
        await cloudinaryRemove(oldPublicId);
      }

      await prisma.profile.upsert({
        where: { userId },
        update: { photoUrl: fullFilename },
        create: {
          userId,
          photoUrl: fullFilename,
          bannerUrl: null,
          resumeUrl: null,
          birthDate: new Date(),
          gender: "Not specified",
          education: "",
          address: "",
          skills: [],
        },
      });

      return { message: "User profile photo updated", filename: fullFilename };
    }

    if (user.role === "ADMIN") {
      const oldLogo = user.company?.logo;
      if (oldLogo) {
        const oldPublicId = oldLogo.split(".")[0];
        await cloudinaryRemove(oldPublicId);
      }

      await prisma.company.upsert({
        where: { adminId: userId },
        update: { logo: fullFilename },
        create: {
          adminId: userId,
          logo: fullFilename,
          description: "",
          location: "",
          bannerUrl: null,
          website: null,
          industry: null,
          foundedYear: null,
        },
      });

      return { message: "Company logo updated", filename: fullFilename };
    }

    throw new Error("Unsupported role");
  } catch (err) {
    throw new Error(
      "Failed to update profile photo/logo: " + (err as Error).message
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

async function UpdateBannerService(
  userId: string,
  role: string,
  file: Express.Multer.File
) {
  if (!file) throw new Error("No file uploaded");

  const uploadRes = await cloudinaryUpload(file);
  const fullFilename = `${uploadRes.public_id}.${uploadRes.format}`;

  if (role === "USER") {
    const existing = await prisma.profile.findUnique({
      where: { userId },
      select: { bannerUrl: true },
    });

    if (existing?.bannerUrl) {
      const publicId = existing.bannerUrl.split(".")[0];
      await cloudinaryRemove(publicId);
    }

    await prisma.profile.update({
      where: { userId },
      data: { bannerUrl: fullFilename },
    });

    return { message: "User banner updated", filename: fullFilename };
  }

  if (role === "ADMIN") {
    const existing = await prisma.company.findUnique({
      where: { adminId: userId },
      select: { bannerUrl: true },
    });

    if (existing?.bannerUrl) {
      const publicId = existing.bannerUrl.split(".")[0];
      await cloudinaryRemove(publicId);
    }

    await prisma.company.update({
      where: { adminId: userId },
      data: { bannerUrl: fullFilename },
    });

    return { message: "Company banner updated", filename: fullFilename };
  }

  throw new Error("Unauthorized role");
}

async function UpdateExperiencesService(
  userId: string,
  experiences: IExperienceInput[]
) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile not found");

  const profileId = profile.id;

  const toCreate = experiences.filter((e) => !e.id);
  const toUpdate = experiences.filter((e) => e.id);
  const toUpdateIds = toUpdate.map((e) => e.id);

  const existing = await prisma.experience.findMany({
    where: { profileId },
    select: { id: true },
  });
  const existingIds = existing.map((e) => e.id);

  const toDelete = existingIds.filter((id) => !toUpdateIds.includes(id));

  await prisma.experience.deleteMany({
    where: { id: { in: toDelete } },
  });

  const updatePromises = toUpdate.map((e) =>
    prisma.experience.update({
      where: { id: e.id },
      data: {
        title: e.title,
        employmentType: e.employmentType
          ? { set: e.employmentType }
          : undefined,
        companyName: e.companyName,
        currentlyWorking: e.currentlyWorking || false,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : undefined,

        location: e.location,
        locationType: e.locationType ? { set: e.locationType } : undefined,
        description: e.description,
      },
    })
  );

  const createPromises = toCreate.map((e) =>
    prisma.experience.create({
      data: {
        title: e.title,
        employmentType: e.employmentType,
        companyName: e.companyName,
        currentlyWorking: e.currentlyWorking || false,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
        location: e.location,
        locationType: e.locationType,
        description: e.description,
        profileId,
      },
    })
  );

  await Promise.all([...updatePromises, ...createPromises]);

  const updatedExperiences = await prisma.experience.findMany({
    where: { profileId },
    orderBy: { startDate: "desc" },
  });

  return updatedExperiences;
}

async function UpdateCompanyProfileService(
  userId: string,
  input: {
    companyName?: string;
    description?: string;
    location?: string;
    website?: string;
    industry?: string;
    foundedYear?: number | null;
  }
) {
  try {
    const {
      companyName,
      description,
      location,
      website,
      industry,
      foundedYear,
    } = input;

    if (companyName) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: companyName },
      });
    }

    const company = await prisma.company.upsert({
      where: { adminId: userId },
      update: {
        description,
        location,
        website,
        industry,
        foundedYear,
      },
      create: {
        adminId: userId,
        description: description || "",
        location: location || "",
        website: website || null,
        industry: industry || null,
        foundedYear: foundedYear || null,
        logo: null,
        bannerUrl: null,
      },
    });

    return company;
  } catch (error) {
    throw new Error(
      "Failed to update company profile: " + (error as Error).message
    );
  }
}

export {
  GetProfileService,
  ChangePasswordService,
  ChangeEmailService,
  UpdateUserProfileService,
  UpdateProfilePhotoService,
  UpdateResumeService,
  UpdateBannerService,
  UpdateExperiencesService,
  UpdateCompanyProfileService,
};
