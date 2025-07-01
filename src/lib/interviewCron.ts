import cron from "node-cron";
import prisma from "../lib/prisma"; // path ke prisma kamu
import dayjs from "dayjs";
import { sendEmail } from "../utils/nodemailer"; // asumsi file nodemailer kamu

export function initInterviewReminderCron() {
  // Setiap hari jam 07:00 pagi
  cron.schedule("0 7 * * *", async () => {
    console.log("Running interview reminder cron...");

    const tomorrowStart = dayjs().add(1, "day").startOf("day").toDate();
    const tomorrowEnd = dayjs().add(1, "day").endOf("day").toDate();

    const interviews = await prisma.interviewSchedule.findMany({
      where: {
        dateTime: {
          gte: tomorrowStart,
          lt: tomorrowEnd,
        },
        reminderSent: false,
      },
      include: {
        user: true,
        job: {
          include: {
            company: {
              include: {
                admin: true,
              },
            },
          },
        },
      },
    });

    for (const interview of interviews) {
      const { user, job, dateTime, location } = interview;

      // Kirim ke pelamar
      await sendEmail({
        to: user.email,
        subject: `Reminder: Interview for ${job.title} - Tomorrow`,
        html: `
          <p>Hi ${user.name},</p>
          <p>This is a friendly reminder that you have an interview scheduled for:</p>
          <ul>
            <li><strong>Job:</strong> ${job.title}</li>
            <li><strong>Company:</strong> ${job.company?.admin.name}</li>
            <li><strong>Date & Time:</strong> ${dayjs(dateTime).format(
              "DD MMM YYYY [at] HH:mm"
            )}</li>
            ${location ? `<li><strong>Location:</strong> ${location}</li>` : ""}
          </ul>
          <p>Please make sure you're prepared and available on time.</p>
          <p>Good luck!</p>
          <br/>
          <p style="font-size: 13px; color: #888;">Precise Job Board • This is an automated reminder</p>
        `,
      });
      console.log(`Reminder sent to applicant: ${user.email}`);

      // Kirim ke admin
      const admin = await prisma.user.findUnique({
        where: { id: job.company?.adminId || "" },
      });

      if (admin) {
        await sendEmail({
          to: admin.email,
          subject: `Reminder: Interview scheduled for ${user.name}`,
          html: `
            <p>Hello ${admin.name},</p>
            <p>This is a reminder that <strong>${
              user.name
            }</strong> has an interview scheduled:</p>
            <ul>
              <li><strong>Job:</strong> ${job.title}</li>
              <li><strong>Date & Time:</strong> ${dayjs(dateTime).format(
                "DD MMM YYYY [at] HH:mm"
              )}</li>
              ${
                location
                  ? `<li><strong>Location:</strong> ${location}</li>`
                  : ""
              }
            </ul>
            <p>Keep in touch with the candidate if any changes are needed.</p>
            <br/>
            <p style="font-size: 13px; color: #888;">Precise Job Board • Automated reminder</p>
          `,
        });
        console.log(`Reminder sent to admin: ${admin.email}`);
      }

      // Update reminderSent agar tidak dikirim ulang
      await prisma.interviewSchedule.update({
        where: { id: interview.id },
        data: { reminderSent: true },
      });
    }

    console.log(`${interviews.length} interview reminder(s) sent`);
  });
}
