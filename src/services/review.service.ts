import prisma from "../lib/prisma";

export const createReview = async (userId: string, input: any) => {
  return prisma.companyReview.create({
    data: {
      ...input,
      userId,
    },
  });
};

export const getCompanyReviews = async (companyId: string) => {
  return prisma.companyReview.findMany({
    where: { companyId, isVerified: true },
    orderBy: { id: "desc" },
    select: {
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
  });
};

export const verifyReview = async (id: string) => {
  return prisma.companyReview.update({
    where: { id },
    data: { isVerified: true },
  });
};
