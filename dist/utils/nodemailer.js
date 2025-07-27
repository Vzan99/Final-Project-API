"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReminderEmail = exports.sendEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const dayjs_1 = __importDefault(require("dayjs"));
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.NODEMAILER_USER,
        pass: config_1.NODEMAILER_PASS,
    },
});
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, html, }) {
    try {
        yield exports.transporter.sendMail({
            from: `"Precise" <${config_1.NODEMAILER_USER}>`,
            to,
            subject,
            html,
        });
    }
    catch (err) {
        console.error(` Failed to send email to ${to}`, err);
    }
});
exports.sendEmail = sendEmail;
function generateReminderHTML(name, formattedDate) {
    const baseUrl = process.env.FE_URL || "http://localhost:3000";
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <img src="https://i.ibb.co/yqDJL6x/precise-logo.png" alt="Precise Logo" height="48" />
      <h2> Subscription Reminder</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Langganan kamu akan <strong>berakhir pada ${formattedDate}</strong>.</p>
      <p>Yuk perpanjang agar kamu tetap bisa menggunakan fitur premium seperti:</p>
      <ul>
        <li> CV Generator</li>
        <li> Skill Assessment</li>
        <li> Priority Review (Professional)</li>
      </ul>
     <a href="${baseUrl}/subscription/upgrade"
         style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
        Perpanjang Sekarang
      </a>
      <p style="margin-top: 32px;">Terima kasih,<br />Team Precise</p>
    </div>
  `;
}
const sendReminderEmail = (to, name, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const formattedDate = (0, dayjs_1.default)(endDate).format("DD MMM YYYY");
    const html = generateReminderHTML(name, formattedDate);
    yield (0, exports.sendEmail)({
        to,
        subject: "🔔 Subscription akan segera berakhir",
        html,
    });
});
exports.sendReminderEmail = sendReminderEmail;
