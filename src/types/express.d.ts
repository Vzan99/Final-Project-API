import { Role, Subscription } from "@prisma/client";

export interface IUserReqParam {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserReqParam;
      subscription?: Subscription;
    }
  }
}

export {};
