export interface IUpdateProfileInput {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  birthDate: string;
  gender: string;
  education: string;
  address: string;
  skills: string[];
  about?: string;
}
