import { z } from "zod";

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

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const experienceSchema = z
  .object({
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
    startDate: z
      .string()
      .regex(dateRegex, "Invalid start date format. Use YYYY-MM-DD."),
    endDate: z
      .string()
      .regex(dateRegex, "Invalid end date format. Use YYYY-MM-DD.")
      .optional()
      .or(z.literal("")),
    location: z.string().optional(),
    locationType: z.enum(["REMOTE", "ON_SITE", "HYBRID"]),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.currentlyWorking) {
        return !data.endDate || data.endDate === "";
      } else {
        return !!data.endDate && data.endDate !== "";
      }
    },
    {
      message:
        "End date is required unless currently working (and must be empty if currently working).",
      path: ["endDate"],
    }
  );

export const updateExperiencesSchema = z.object({
  experiences: z.array(experienceSchema),
});

export const updateCompanyProfileSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters")
    .optional(),

  description: z.string().optional(),

  location: z.string().optional(),

  website: z.string().url().optional().or(z.literal("")),

  industry: z.string().optional(),

  foundedYear: z
    .union([z.string(), z.number()])
    .transform((val) => (val ? Number(val) : null))
    .refine(
      (val) => val === null || (val >= 1800 && val <= new Date().getFullYear()),
      {
        message: "Founded year must be between 1800 and current year",
      }
    )
    .optional(),
});
