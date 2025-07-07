import { EmploymentType, LocationType } from "@prisma/client";

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

export interface IExperienceInput {
  id?: string;
  title: string;
  employmentType?: EmploymentType;
  companyName: string;
  currentlyWorking?: boolean;
  startDate: Date;
  endDate?: Date;
  location?: string;
  locationType?: LocationType;
  description?: string;
}
