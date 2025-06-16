import nodemailer from "nodemailer";
import { NODEMAILER_USER, NODEMAILER_PASS } from "../config";

// Transporter: Gmail
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
});

// Wrapper function
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
