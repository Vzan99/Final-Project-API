import cron from "node-cron";
import prisma from "./prisma";
import dayjs from "dayjs";
import { sendReminderEmail } from "../utils/nodemailer";

export function initSubscriptionCron() {
  // Setiap hari jam 8 pagi
  cron.schedule("0 8 * * *", async () => {
    const tomorrow = dayjs().add(1, "day").startOf("day").toDate();
    const dayAfter = dayjs(tomorrow).add(1, "day").toDate();

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        endDate: {
          gte: tomorrow,
          lt: dayAfter,
        },
        isApproved: true,
        paymentStatus: "PAID",
      },
      include: {
        user: true,
      },
    });

    for (const sub of expiringSoon) {
      try {
        await sendReminderEmail(sub.user.email, sub.user.name, sub.endDate);
      } catch (err) {
        console.error(`Failed to send email to ${sub.user.email}`, err);
      }
    }
  });
}
