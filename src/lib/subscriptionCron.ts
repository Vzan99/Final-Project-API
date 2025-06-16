import cron from "node-cron";
import prisma from "./prisma";
import dayjs from "dayjs";
import { sendEmail } from "../utils/nodemailer";

export function initSubscriptionCron() {
  // Setiap hari jam 8 pagi
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Running subscription cron...");

    const tomorrow = dayjs().add(1, "day").startOf("day").toDate();
    const now = new Date();

    // H-1 Reminder
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        endDate: {
          gte: tomorrow,
          lt: dayjs(tomorrow).add(1, "day").toDate(),
        },
        isApproved: true,
        paymentStatus: "PAID",
      },
      include: {
        user: true,
      },
    });

    for (const sub of expiringSoon) {
      await sendEmail({
        to: sub.user.email,
        subject: "🔔 Subscription Renewal Reminder",
        html: `
          <p>Hi ${sub.user.name},</p>
          <p>Langganan kamu akan berakhir pada <strong>${dayjs(
            sub.endDate
          ).format("DD MMM YYYY")}</strong>.</p>
          <p>Silakan perpanjang agar tetap bisa mengakses fitur premium seperti CV Generator dan Skill Assessment.</p>
        `,
      });
      console.log(`🔔 Sent reminder to ${sub.user.email}`);
    }
  });
}
