import {
  IRegisterUserParam,
  IRegisterAdminParam,
  ILoginParam,
} from "../interfaces/user.interface";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { findUserByEmail } from "../helpers/user.helper";
import { SECRET_KEY } from "../config";

async function RegisterUserService(param: IRegisterUserParam) {
  try {
    const isEmailExist = await findUserByEmail(param.email);
    if (isEmailExist) throw new Error("Email is already exist");

    const hashedPassword = await bcrypt.hash(param.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: param.email,
          password: hashedPassword,
          role: Role.USER,
          isVerified: false,
          name: "",
        },
      });

      return newUser;
    });

    return user;
  } catch (err) {
    throw err;
  }
}

async function RegisterAdminCompanyService(param: IRegisterAdminParam) {
  try {
    const isEmailExist = await findUserByEmail(param.email);
    if (isEmailExist) throw new Error("Email is already exist");

    const hashedPassword = await bcrypt.hash(param.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: param.email,
          password: hashedPassword,
          role: Role.ADMIN,
          isVerified: false,
          name: param.companyName,
        },
      });

      const company = await tx.company.create({
        data: {
          name: param.companyName,
          email: param.email,
          phone: param.phone,
          adminId: user.id,
          description: "",
          location: "",
        },
      });

      return { user, company };
    });

    return result;
  } catch (err) {
    throw err;
  }
}

async function LoginService(param: ILoginParam) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: param.email },
    });

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(param.password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    const token = sign(payload, String(SECRET_KEY), { expiresIn: "7d" });

    return {
      user: payload,
      token,
    };
  } catch (err) {
    throw err;
  }
}

export { RegisterUserService, RegisterAdminCompanyService, LoginService };
