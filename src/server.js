console.log("SERVER START")
require("dotenv").config();

const app = require("./app");

const PORT =
  process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );

  console.log(
    "ACTIVE HANDLES:",
    process._getActiveHandles().length
  );

  console.log(
    "SERVER OBJECT EXISTS:",
    !!server
  );
});

server.on(
  "request",
  (req, res) => {
    console.log(
      "SERVER GOT REQUEST:",
      req.method,
      req.url
    );
  }
);

server.on("listening", () => {
  console.log("LISTENING EVENT");
});

server.on("close", () => {
  console.log("SERVER CLOSED");
});

process.on("exit", (code) => {
  console.log("PROCESS EXIT", code);
});

process.on("beforeExit", (code) => {
  console.log("BEFORE EXIT", code);
});
