import prisma from "../lib/prisma";
import dayjs from "dayjs";

export const getAllSubscriptions = async () => {
  return prisma.subscription.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const approveSubscriptionById = async (id: string) => {
  const startDate = new Date();
  const endDate = dayjs(startDate).add(30, "day").toDate();

  return prisma.subscription.update({
    where: { id },
    data: {
      isApproved: true,
      paymentStatus: "PAID",
      startDate,
      endDate,
    },
  });
};
