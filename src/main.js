import express from "express";
import appConfig from "./configs/app.config.js";
import { connectDb } from "./configs/db.config.js";
import apiRouter from "./routers/index.js";

const app = express();

app.use(express.json());

connectDb()
  .then((res) => console.log(res))
  .catch((err) => console.log(err.message));

app.use("/api", apiRouter)

app.all("*splat", (req, res) => {
  res.status(404).send({
    success: false,
    message: `Given URL: ${req.url} not found`,
  });
});

app.listen(appConfig.port, () => {
  console.log(`listening on ${appConfig.port}`);
});
