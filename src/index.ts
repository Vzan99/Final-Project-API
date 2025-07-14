import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import { FE_URL, PORT } from "./config";

// ─── Routers ─────────────────────────────────────────────
import AuthRouter from "./routers/auth.router";
import ProfileRouter from "./routers/profile.router";
import PreTestRouter from "./routers/preTest.router";
import JobRouter from "./routers/job.router";
import ApplicationRouter from "./routers/application.router";
import InterviewRouter from "./routers/interview.router";
import subscriptionRouter from "./routers/subscription.router";
import cvRouter from "./routers/cv.router";
import AnalyticsRouter from "./routers/analytics.router";
import assessmentRouter from "./routers/assessment.router";
import certificateRouter from "./routers/certificate.router";
import ReviewRouter from "./routers/review.router";
import CompaniesRouter from "./routers/company.router";

// ─── Cron Jobs ────────────────────────────────────────────
import { initSubscriptionCron } from "./lib/subscriptionCron";
import { initInterviewReminderCron } from "./lib/interviewCron";
import { scheduleAutoCloseJobs } from "./lib/autoCloseJobsCron";

// ─── Express App Setup ───────────────────────────────────
const app: Application = express();
const port = PORT || 8000;

app.use(
  cors({
    origin: FE_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ─── Auth ────────────────────────────────────────────────
app.use("/auth", AuthRouter);

// ─── User Profile & CV ───────────────────────────────────
app.use("/profile", ProfileRouter);
app.use("/user", cvRouter);

// ─── Job Flow ─────────────────────────────────────────────
app.use("/jobs", JobRouter);
app.use("/applications", ApplicationRouter);
app.use("/interviews", InterviewRouter);
app.use("/pre-selection-tests", PreTestRouter);

// ─── Account Subscription ──────────────────────────────
app.use("/subscriptions", subscriptionRouter);

// ─── Company Reviews ──────────────────────────────────────────────
app.use("/reviews", ReviewRouter);

// ─── Skill Assessment ────────────────────────────────────
app.use("/assessments", assessmentRouter);

// ─── Certificate ──────────────────────────────────────────
app.use("/certificates", certificateRouter);

// ─── Analytics ────────────────────────────────────────────
app.use("/analytics", AnalyticsRouter);

// ─── Companies ────────────────────────────────────────────
app.use("/companies", CompaniesRouter);

// ─── Server Start ─────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// ─── Cron Jobs Init ───────────────────────────────────────
initSubscriptionCron();
initInterviewReminderCron();
scheduleAutoCloseJobs();
