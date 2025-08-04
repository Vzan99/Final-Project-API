"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config");
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const profile_router_1 = __importDefault(require("./routers/profile.router"));
const preTest_router_1 = __importDefault(require("./routers/preTest.router"));
const job_router_1 = __importDefault(require("./routers/job.router"));
const application_router_1 = __importDefault(require("./routers/application.router"));
const interview_router_1 = __importDefault(require("./routers/interview.router"));
const subscription_router_1 = __importDefault(require("./routers/subscription.router"));
const cv_router_1 = __importDefault(require("./routers/cv.router"));
const analytics_router_1 = __importDefault(require("./routers/analytics.router"));
const assessment_router_1 = __importDefault(require("./routers/assessment.router"));
const review_router_1 = __importDefault(require("./routers/review.router"));
const company_router_1 = __importDefault(require("./routers/company.router"));
const subscriptionCron_1 = require("./lib/subscriptionCron");
const interviewCron_1 = require("./lib/interviewCron");
const autoCloseJobsCron_1 = require("./lib/autoCloseJobsCron");
dotenv_1.default.config();
// ─── Express App Setup ───────────────────────────────────
const app = (0, express_1.default)();
const port = config_1.PORT || 8000;
app.use((0, cors_1.default)({
    origin: config_1.FE_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// ─── Auth ────────────────────────────────────────────────
app.use("/auth", auth_router_1.default);
// ─── User Profile & CV ───────────────────────────────────
app.use("/profile", profile_router_1.default);
app.use("/user", cv_router_1.default);
// ─── Job Flow ─────────────────────────────────────────────
app.use("/jobs", job_router_1.default);
app.use("/applications", application_router_1.default);
app.use("/interviews", interview_router_1.default);
app.use("/pre-selection-tests", preTest_router_1.default);
// ─── Account Subscription ──────────────────────────────
app.use("/subscriptions", subscription_router_1.default);
// ─── Company Reviews ──────────────────────────────────────────────
app.use("/reviews", review_router_1.default);
// ─── Skill Assessment ────────────────────────────────────
app.use("/assessments", assessment_router_1.default);
// ─── Analytics ────────────────────────────────────────────
app.use("/analytics", analytics_router_1.default);
// ─── Companies ────────────────────────────────────────────
app.use("/companies", company_router_1.default);
// ─── Server Start ─────────────────────────────────────────
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
// ─── Cron Jobs Init ───────────────────────────────────────
(0, subscriptionCron_1.initSubscriptionCron)();
(0, interviewCron_1.initInterviewReminderCron)();
(0, autoCloseJobsCron_1.scheduleAutoCloseJobs)();
