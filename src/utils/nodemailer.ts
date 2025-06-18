import nodemailer from "nodemailer";
import { NODEMAILER_USER, NODEMAILER_PASS } from "../config";
import dayjs from "dayjs";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: `"Precise" <${NODEMAILER_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`📨 Email sent to ${to} | subject: ${subject}`);
};

export const sendReminderEmail = async (
  to: string,
  name: string,
  endDate: Date
) => {
  const formattedDate = dayjs(endDate).format("DD MMM YYYY");

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <img src="https://i.ibb.co/yqDJL6x/precise-logo.png" alt="Precise Logo" height="48" />
      <h2>🔔 Subscription Reminder</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Langganan kamu akan <strong>berakhir pada ${formattedDate}</strong>.</p>
      <p>Yuk perpanjang agar kamu tetap bisa menggunakan fitur premium seperti:</p>
      <ul>
        <li>📄 CV Generator</li>
        <li>🧠 Skill Assessment</li>
        <li>⭐️ Priority Review (Professional)</li>
      </ul>
      <a href="https://precise-app.com/subscribe" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Perpanjang Sekarang</a>
      <p style="margin-top: 32px;">Terima kasih,<br />Team Precise</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: "🔔 Subscription akan segera berakhir",
    html,
  });
};
