export interface IRegisterUserParam {
  email: string;
  password: string;
}

export interface IRegisterAdminParam {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface ILoginParam {
  email: string;
  password: string;
}
