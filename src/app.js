const express = require("express");
const cors=require('cors')

const app = express();

const cookie = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const reportRouter = require("./routes/report.routes");
const dashboardRouter = require("./routes/dashboard.routes");
const profileRouter = require("./routes/profile.routes");

app.use(express.json());

app.use(cookie());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/report", reportRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/profile", profileRouter);

module.exports = app;
