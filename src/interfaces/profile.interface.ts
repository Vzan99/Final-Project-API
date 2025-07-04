export interface IUpdateProfileInput {
  userId: string;
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  education?: string;
  address?: string;
  skills?: string[];
  about?: string;
}
