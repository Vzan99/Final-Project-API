import { Request, Response, NextFunction } from "express";
import {
  RegisterUserService,
  LoginService,
  RegisterAdminService,
  VerifyEmailService,
  ResendVerificationEmailService,
  SyncGoogleUserService,
  RequestPasswordResetService,
  ResetPasswordService,
  VerifyNewEmailService,
} from "../services/auth.service";

async function RegisterUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Error("Missing required fields"));
  }

  try {
    const user = await RegisterUserService({
      email,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function RegisterAdminController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name || !phone) {
    return next(new Error("Missing required fields"));
  }

  try {
    const { user } = await RegisterAdminService({
      email,
      password,
      name,
      phone,
    });

    res.status(201).json({
      message: "Company admin registered successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function LoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Error("Missing email or password"));
  }
  const isProd = process.env.NODE_ENV === "production";

  try {
    const { user, token } = await LoginService({ email, password });

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        user,
        token,
      });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

export async function LogoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProd = process.env.NODE_ENV === "production";

  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function VerifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = (req as any).validatedQuery.token as string;

    const result = await VerifyEmailService(token);

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function ResendVerificationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return next(new Error("Unauthorized"));

    const result = await ResendVerificationEmailService(userId);

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function SyncGoogleUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.split(" ")[1];

    const { user, token: jwtToken } = await SyncGoogleUserService(token);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("access_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "User synced", user });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function RequestPasswordResetController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  if (!email) throw new Error("Email is Required");

  try {
    const result = await RequestPasswordResetService(email);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function ResetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    throw new Error("Token and new password is Required");

  try {
    const result = await ResetPasswordService(token, newPassword);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Something went wrong" });
  }
}

async function VerifyNewEmailController(req: Request, res: Response) {
  const token = req.query.token as string;
  if (!token) throw new Error("Token is Required");

  try {
    const result = await VerifyNewEmailService(token);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export {
  RegisterUserController,
  RegisterAdminController,
  LoginController,
  VerifyEmailController,
  ResendVerificationController,
  SyncGoogleUserController,
  RequestPasswordResetController,
  ResetPasswordController,
  VerifyNewEmailController,
};
