const express = require("express");
const cors=require('cors')

const app = express();

const cookie = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const AiRouter = require("./routes/report.routes");

app.use(express.json());

app.use(cookie());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/Ai", AiRouter);

module.exports = app;
