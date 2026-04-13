import express from "express";
import appConfig from "./configs/app.config.js";
import { connectDb } from "./configs/db.config.js";
import apiRouter from "./routers/index.js";
import cookieParser from "cookie-parser";
import { NotFoundException } from "./exceptions/not-found.exception.js"; //404
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(cookieParser("secret-key"));
app.use(morgan("dev"));

connectDb()
  .then((res) => console.log(res))
  .catch((err) => console.log(err.message));

app.use("/api", apiRouter);

app.all("*splat", (req, res) => {
  throw new NotFoundException(`Given URL: ${req.url} not found`);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught exception: ", err);

  process.exit(1);
});

const server = app.listen(appConfig.port, () => {
  console.log(`listening on ${appConfig.port}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(
    "Unhandled rejection error reason: ",
    reason,
    " PROMISE: ",
    promise,
  );

  server.close(() => {
    process.exit(1);
  });
});
