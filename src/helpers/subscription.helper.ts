import prisma from "../lib/prisma";

export const findActiveSubscriptionByUserId = async (userId: string) => {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      isApproved: true,
      paymentStatus: "PAID",
      endDate: { gte: new Date() },
    },
  });
};
