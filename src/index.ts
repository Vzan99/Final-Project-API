import express, { Application } from "express";
import cors from "cors";
import { FE_URL, PORT } from "./config";
import cookieParser from "cookie-parser";

import AuthRouter from "./routers/auth.router";
import ProfileRouter from "./routers/profile.router";
import PreTestRouter from "./routers/preTest.router";
import JobRouter from "./routers/job.router";
import subscriptionRouter from "./routers/subscription.router";
import { initSubscriptionCron } from "./lib/subscriptionCron";
import { initInterviewReminderCron } from "./lib/interviewCron";
import cvRouter from "./routers/cv.router";
import ApplicationRouter from "./routers/application.router";
import InterviewRouter from "./routers/interview.router";

const port = PORT || 8000;
const app: Application = express();

app.use(
  cors({
    origin: FE_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", AuthRouter);
app.use("/pre-selection-tests", PreTestRouter);
app.use("/jobs", JobRouter);

app.use("/profile", ProfileRouter);

app.use("/subscriptions", subscriptionRouter);
app.use("/user", cvRouter);
app.use("/applications", ApplicationRouter);
app.use("/interviews", InterviewRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

initSubscriptionCron();
initInterviewReminderCron();
