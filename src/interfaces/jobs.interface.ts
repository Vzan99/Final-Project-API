import { Job, Company, User } from "@prisma/client";

export interface JobWithRelations extends Job {
  company: Company & {
    admin: Pick<User, "id" | "name">;
  };
  // category: Category | null; // ❌ HAPUS karena tidak ada relasi Category
}

export interface JobFilters {
  title?: string;
  location?: string;
  employmentType?: string; // ✅ ganti dari jobType
  jobCategory?: string; // ✅ tambahan baru untuk filter kategori pekerjaan
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "salary";
  sortOrder?: "asc" | "desc";

  listingTime?:
    | "any"
    | "today"
    | "3days"
    | "7days"
    | "14days"
    | "30days"
    | "custom";
  customStartDate?: string;
  customEndDate?: string;
}

export interface PaginatedJobs {
  total: number;
  jobs: JobWithRelations[];
}
