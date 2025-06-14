import { Request, Response, NextFunction } from "express";
import {
  RegisterUserService,
  LoginService,
  RegisterAdminService,
} from "../services/auth.service";
import { loginWithGoogle } from "../services/googleAuth.service";

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

    res.status(200).cookie("access_token", token).send({
      message: "Login successful",
      user: user,
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function GoogleLoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { idToken } = req.body;
    const user = await loginWithGoogle(idToken);

    // You can issue a JWT or session here
    res.json({ message: "Login successful", user });
  } catch (err) {
    next(err);
  }
}

export { RegisterUserController, RegisterAdminController, LoginController };
