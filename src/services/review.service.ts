import prisma from "../lib/prisma";

export const createReview = async (userId: string, input: any) => {
  return prisma.companyReview.create({
    data: {
      ...input,
      isVerified: true,
      userId,
    },
  });
};

export const getCompanyReviews = async (
  companyId: string,
  page: number,
  pageSize: number
) => {
  const [reviews, total] = await prisma.$transaction([
    prisma.companyReview.findMany({
      where: { companyId, isVerified: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        rating: true,
        salaryEstimate: true,
        content: true,
        position: true,
        isAnonymous: true,
        cultureRating: true,
        workLifeRating: true,
        careerRating: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.companyReview.count({
      where: { companyId, isVerified: true },
    }),
  ]);

  return { reviews, total };
};

export const verifyReview = async (id: string) => {
  return prisma.companyReview.update({
    where: { id },
    data: { isVerified: true },
  });
};
