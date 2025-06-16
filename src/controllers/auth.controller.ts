import { Request, Response, NextFunction } from "express";
import {
  RegisterUserService,
  LoginService,
  RegisterAdminService,
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
    const { user, company } = await RegisterAdminService({
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
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
      },
    });
  } catch (err) {
    next(err);
  }
}

const isProd = process.env.NODE_ENV === "production";

// --- LOGIN CONTROLLER ---
async function LoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Error("Missing email or password"));
  }

  try {
    const { user, token } = await LoginService({ email, password });

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: isProd, // true in prod, false in dev
        sameSite: isProd ? "none" : "lax", // 'none' requires HTTPS, 'lax' works for dev
        path: "/", // must match logout
        maxAge: 24 * 60 * 60 * 1000, // 1 day
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

// --- LOGOUT CONTROLLER ---
export async function LogoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("Clearing access_token cookie...");

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/", // must match how it was set
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
}

export { RegisterUserController, RegisterAdminController, LoginController };
