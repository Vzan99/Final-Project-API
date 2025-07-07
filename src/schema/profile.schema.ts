import { z } from "zod";
import { EmploymentType, LocationType } from "@prisma/client";

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z
    .union([z.string(), z.date()])
    .transform((val) => new Date(val))
    .optional(),
  gender: z.string().optional(),
  education: z.string().optional(),
  address: z.string().optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  about: z.string().optional(),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

const experienceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  companyName: z.string(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "TEMPORARY",
    "VOLUNTEER",
    "OTHER",
  ]),
  currentlyWorking: z.boolean().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  locationType: z.enum(["REMOTE", "ON_SITE", "HYBRID"]),
  description: z.string().optional(),
});

export const updateExperiencesSchema = z.object({
  experiences: z.array(experienceSchema),
});
