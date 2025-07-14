import prisma from "../lib/prisma";

interface GetAllCompaniesParams {
  name?: string;
  location?: string;
  sortBy?: "name" | "location";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function GetAllCompaniesService(params: GetAllCompaniesParams) {
  const {
    name,
    location,
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    pageSize = 10,
  } = params;

  const where: any = {
    ...(location && {
      location: {
        contains: location,
        mode: "insensitive",
      },
    }),
    ...(name && {
      admin: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    }),
  };

  const total = await prisma.company.count({
    where,
  });

  const skip = (page - 1) * pageSize;

  const companies = await prisma.company.findMany({
    where,
    include: {
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy:
      sortBy === "name"
        ? {
            admin: {
              name: sortOrder,
            },
          }
        : {
            location: sortOrder,
          },
    skip,
    take: pageSize,
  });

  return {
    total,
    page,
    pageSize,
    companies,
  };
}

export async function getCompanyByIdService(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}
