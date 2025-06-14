export interface IRegisterUserParam {
  email: string;
  password: string;
}

export interface IRegisterAdminCompanyParam {
  email: string;
  password: string;
  companyName: string;
  phone: string;
}

export interface ILoginParam {
  email: string;
  password: string;
}
