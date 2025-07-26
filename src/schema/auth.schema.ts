import { z } from "zod";

export const RegisterUserSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .nonempty("Password is required"),
});

export const RegisterAdminSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .nonempty("Password is required"),
  name: z.string().min(2, "Company name is at least 2 letters").trim(),
  phone: z
    .string()
    .min(6, "Phone number is required")
    .max(20)
    .regex(/^[\d\s()+-]+$/, "Phone number format is invalid")
    .trim(),
});

export const LoginSchema = z.object({
  email: z.string().email("invalid email format").trim(),
  password: z.string().min(1, "Password is required"),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .nonempty("New password is required"),
});
