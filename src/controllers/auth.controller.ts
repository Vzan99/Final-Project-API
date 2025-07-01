import { Request, Response, NextFunction } from "express";
import {
  RegisterUserService,
  LoginService,
  RegisterAdminService,
  VerifyEmailService,
  SyncGoogleUserService,
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    console.error("Verification error:", err);
    next(err);
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
  } catch (err) {
    next(err);
  }
}

export {
  RegisterUserController,
  RegisterAdminController,
  LoginController,
  VerifyEmailController,
  SyncGoogleUserController,
};
