import express, { Application } from "express";
import { FE_URL, PORT } from "./config";

import AuthRouter from "./routers/auth.router";
import PreTestRouter from "./routers/preTest.router";
import JobRouter from "./routers/job.router";

const port = PORT || 8000;
const app: Application = express();

//Middleware
app.use(express.json());

app.use("/auth", AuthRouter);
app.use("/pre-selection-tests", PreTestRouter);
app.use("/jobs", JobRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
