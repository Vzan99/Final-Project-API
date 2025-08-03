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
exports.GetProfileService = GetProfileService;
exports.ChangePasswordService = ChangePasswordService;
exports.ChangeEmailService = ChangeEmailService;
exports.UpdateUserProfileService = UpdateUserProfileService;
exports.UpdateProfilePhotoService = UpdateProfilePhotoService;
exports.UpdateResumeService = UpdateResumeService;
exports.UpdateBannerService = UpdateBannerService;
exports.UpdateExperiencesService = UpdateExperiencesService;
exports.UpdateCompanyProfileService = UpdateCompanyProfileService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const date_fns_1 = require("date-fns");
const nodemailer_1 = require("../utils/nodemailer");
const cloudinary_1 = require("../utils/cloudinary");
function GetProfileService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield prisma_1.default.user.findUnique({
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
            const sub = (_a = user.subscriptions) === null || _a === void 0 ? void 0 : _a[0];
            const subscription = sub
                ? {
                    status: now > sub.endDate ? "INACTIVE" : "ACTIVE",
                    type: sub.type,
                    startDate: sub.startDate,
                    endDate: sub.endDate,
                }
                : undefined;
            const baseResponse = {
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
            }
            else if (user.role === "ADMIN") {
                baseResponse.company = user.company;
            }
            return baseResponse;
        }
        catch (err) {
            throw err;
        }
    });
}
function ChangePasswordService(userId, currentPassword, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) {
            throw new Error("User not found or social login user");
        }
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: "Password changed successfully" };
    });
}
function ChangeEmailService(userId, newEmail, currentPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.SECRET_KEY)
            throw new Error("Missing SECRET_KEY");
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || !user.password)
            throw new Error("User not found or social login user");
        const match = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!match)
            throw new Error("Current password is incorrect");
        const normalized = newEmail.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
            throw new Error("Invalid email address");
        const already = yield prisma_1.default.user.findUnique({
            where: { email: normalized },
        });
        if (already)
            throw new Error("Email is already in use");
        const token = (0, jsonwebtoken_1.sign)({ userId, newEmail: normalized }, config_1.SECRET_KEY, {
            expiresIn: "1h",
        });
        yield prisma_1.default.verificationToken.upsert({
            where: { userId },
            update: { token, expiresAt: (0, date_fns_1.addHours)(new Date(), 1) },
            create: { userId, token, expiresAt: (0, date_fns_1.addHours)(new Date(), 1) },
        });
        const name = user.name || user.email.split("@")[0];
        const verificationLink = `${config_1.FE_URL}/auth/verify-new-email?token=${token}`;
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
        yield (0, nodemailer_1.sendEmail)({
            to: normalized,
            subject: "Verify Your New Email Address",
            html,
        });
        return { message: "Verification link sent to your new email." };
    });
}
function UpdateUserProfileService(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, name, phone, birthDate, gender, education, address, skills, about, } = input;
        function removeUndefined(obj) {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});
        }
        try {
            yield prisma_1.default.user.update({
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
            const profile = yield prisma_1.default.profile.upsert({
                where: { userId },
                update: profileUpdateData,
                create: profileCreateData,
            });
            return profile;
        }
        catch (error) {
            throw new Error("Failed to update profile: " + error.message);
        }
    });
}
function UpdateProfilePhotoService(userId, file) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    role: true,
                    profile: { select: { photoUrl: true } },
                    company: { select: { logo: true } },
                },
            });
            if (!user)
                throw new Error("User not found");
            const uploadRes = yield (0, cloudinary_1.cloudinaryUpload)(file);
            const fullFilename = `${uploadRes.public_id}.${uploadRes.format}`;
            if (user.role === "USER") {
                const oldPhoto = (_a = user.profile) === null || _a === void 0 ? void 0 : _a.photoUrl;
                if (oldPhoto) {
                    const oldPublicId = oldPhoto.split(".")[0];
                    yield (0, cloudinary_1.cloudinaryRemove)(oldPublicId);
                }
                yield prisma_1.default.profile.upsert({
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
                const oldLogo = (_b = user.company) === null || _b === void 0 ? void 0 : _b.logo;
                if (oldLogo) {
                    const oldPublicId = oldLogo.split(".")[0];
                    yield (0, cloudinary_1.cloudinaryRemove)(oldPublicId);
                }
                yield prisma_1.default.company.upsert({
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
        }
        catch (err) {
            throw new Error("Failed to update profile photo/logo: " + err.message);
        }
    });
}
function UpdateResumeService(userId, file) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    profile: { select: { resumeUrl: true } },
                },
            });
            const oldResume = (_a = user === null || user === void 0 ? void 0 : user.profile) === null || _a === void 0 ? void 0 : _a.resumeUrl;
            const uploadRes = yield (0, cloudinary_1.cloudinaryUpload)(file, "raw");
            const ext = path_1.default.extname(file.originalname);
            const fullFilename = `${uploadRes.public_id}${ext}`;
            if (oldResume) {
                const oldPublicId = oldResume.split(".")[0];
                yield (0, cloudinary_1.cloudinaryRemove)(oldPublicId);
            }
            yield prisma_1.default.profile.update({
                where: { userId },
                data: { resumeUrl: fullFilename },
            });
            return { message: "Resume uploaded successfully", filename: fullFilename };
        }
        catch (err) {
            throw new Error("Failed to update resume: " + err.message);
        }
    });
}
function UpdateBannerService(userId, role, file) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!file)
            throw new Error("No file uploaded");
        const uploadRes = yield (0, cloudinary_1.cloudinaryUpload)(file);
        const fullFilename = `${uploadRes.public_id}.${uploadRes.format}`;
        if (role === "USER") {
            const existing = yield prisma_1.default.profile.findUnique({
                where: { userId },
                select: { bannerUrl: true },
            });
            if (existing === null || existing === void 0 ? void 0 : existing.bannerUrl) {
                const publicId = existing.bannerUrl.split(".")[0];
                yield (0, cloudinary_1.cloudinaryRemove)(publicId);
            }
            yield prisma_1.default.profile.update({
                where: { userId },
                data: { bannerUrl: fullFilename },
            });
            return { message: "User banner updated", filename: fullFilename };
        }
        if (role === "ADMIN") {
            const existing = yield prisma_1.default.company.findUnique({
                where: { adminId: userId },
                select: { bannerUrl: true },
            });
            if (existing === null || existing === void 0 ? void 0 : existing.bannerUrl) {
                const publicId = existing.bannerUrl.split(".")[0];
                yield (0, cloudinary_1.cloudinaryRemove)(publicId);
            }
            yield prisma_1.default.company.update({
                where: { adminId: userId },
                data: { bannerUrl: fullFilename },
            });
            return { message: "Company banner updated", filename: fullFilename };
        }
        throw new Error("Unauthorized role");
    });
}
function UpdateExperiencesService(userId, experiences) {
    return __awaiter(this, void 0, void 0, function* () {
        const profile = yield prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error("Profile not found");
        const profileId = profile.id;
        const toCreate = experiences.filter((e) => !e.id);
        const toUpdate = experiences.filter((e) => e.id);
        const toUpdateIds = toUpdate.map((e) => e.id);
        const existing = yield prisma_1.default.experience.findMany({
            where: { profileId },
            select: { id: true },
        });
        const existingIds = existing.map((e) => e.id);
        const toDelete = existingIds.filter((id) => !toUpdateIds.includes(id));
        yield prisma_1.default.experience.deleteMany({
            where: { id: { in: toDelete } },
        });
        const updatePromises = toUpdate.map((e) => prisma_1.default.experience.update({
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
        }));
        const createPromises = toCreate.map((e) => prisma_1.default.experience.create({
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
        }));
        yield Promise.all([...updatePromises, ...createPromises]);
        const updatedExperiences = yield prisma_1.default.experience.findMany({
            where: { profileId },
            orderBy: { startDate: "desc" },
        });
        return updatedExperiences;
    });
}
function UpdateCompanyProfileService(userId, input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { companyName, description, location, website, industry, foundedYear, } = input;
            if (companyName) {
                yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: { name: companyName },
                });
            }
            const company = yield prisma_1.default.company.upsert({
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
        }
        catch (error) {
            throw new Error("Failed to update company profile: " + error.message);
        }
    });
}
