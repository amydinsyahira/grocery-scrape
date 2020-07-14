require("dotenv").config();
const express = require("express");
const next = require("next");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const log = require('debug')('server');

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 3000;

const router = require("./routes");

nextApp.prepare().then(async () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    logger("dev", {
      skip: req => req.url.includes("_next")
    })
  );

  app.get("/test-route", (req, res) =>
    res.status(200).json({ hello: "Hello, from the back-end world!" })
  );

  router(app, handle);

  app.get("*", (req, res) => {
    return handle(req, res);
  });

  app.listen(port, err => {
    if (err) throw err;
    log(`> Ready on http://localhost:${port}`);
  });
});
