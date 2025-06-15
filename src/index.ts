import express, { Application } from "express";
import cors from "cors";
import { FE_URL, PORT } from "./config";
import cookieParser from "cookie-parser";

import AuthRouter from "./routers/auth.router";
import ProfileRouter from "./routers/profile.router";

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

app.use("/profile", ProfileRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
