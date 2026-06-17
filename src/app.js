const express = require("express");
const cors = require('cors');

console.log("APP FILE LOADED");

const reportRoutes =
  require("./routes/report.routes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use((req, res, next) => {
  console.log(
    "REQUEST RECEIVED:",
    req.method,
    req.url
  );
  next();
});

app.use(express.json());

app.use(
  "/api/reports",
  reportRoutes
);

app.get("/", (req, res) => {
  console.log("ROOT HIT");
  res.send("API UP");
});

module.exports = app;