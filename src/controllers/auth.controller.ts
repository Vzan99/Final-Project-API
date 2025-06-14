import { Request, Response, NextFunction } from "express";
import {
  RegisterUserService,
  LoginService,
  RegisterAdminCompanyService,
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

async function RegisterAdminCompanyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password, companyName, phone } = req.body;

  if (!email || !password || !companyName || !phone) {
    return next(new Error("Missing required fields"));
  }

  try {
    const { user, company } = await RegisterAdminCompanyService({
      email,
      password,
      companyName,
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

export {
  RegisterUserController,
  RegisterAdminCompanyController,
  LoginController,
};
