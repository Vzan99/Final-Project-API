"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyProfileSchema = exports.updateExperiencesSchema = exports.changePasswordSchema = exports.changeEmailSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    birthDate: zod_1.z
        .union([zod_1.z.string(), zod_1.z.date()])
        .transform((val) => new Date(val))
        .optional(),
    gender: zod_1.z.string().optional(),
    education: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    skills: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    about: zod_1.z.string().optional(),
});
exports.changeEmailSchema = zod_1.z.object({
    newEmail: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: zod_1.z
        .string()
        .min(6, "New password must be at least 6 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const experienceSchema = zod_1.z
    .object({
    id: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    companyName: zod_1.z.string(),
    employmentType: zod_1.z.enum([
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
        "TEMPORARY",
        "VOLUNTEER",
        "OTHER",
    ]),
    currentlyWorking: zod_1.z.boolean().optional(),
    startDate: zod_1.z
        .string()
        .regex(dateRegex, "Invalid start date format. Use YYYY-MM-DD."),
    endDate: zod_1.z
        .string()
        .regex(dateRegex, "Invalid end date format. Use YYYY-MM-DD.")
        .optional()
        .or(zod_1.z.literal("")),
    location: zod_1.z.string().optional(),
    locationType: zod_1.z.enum(["REMOTE", "ON_SITE", "HYBRID"]),
    description: zod_1.z.string().optional(),
})
    .refine((data) => {
    if (data.currentlyWorking) {
        return !data.endDate || data.endDate === "";
    }
    else {
        return !!data.endDate && data.endDate !== "";
    }
}, {
    message: "End date is required unless currently working (and must be empty if currently working).",
    path: ["endDate"],
});
exports.updateExperiencesSchema = zod_1.z.object({
    experiences: zod_1.z.array(experienceSchema),
});
exports.updateCompanyProfileSchema = zod_1.z.object({
    companyName: zod_1.z
        .string()
        .min(1, "Company name is required")
        .max(100, "Company name must be less than 100 characters")
        .optional(),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    industry: zod_1.z.string().optional(),
    foundedYear: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => (val ? Number(val) : null))
        .refine((val) => val === null || (val >= 1800 && val <= new Date().getFullYear()), {
        message: "Founded year must be between 1800 and current year",
    })
        .optional(),
});
