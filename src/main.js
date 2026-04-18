import express from "express";
import appConfig from "./configs/app.config.js";
import { connectDb } from "./configs/db.config.js";
import apiRouter from "./routers/index.js";
import cookieParser from "cookie-parser";
import { NotFoundException } from "./exceptions/not-found.exception.js"; //404
import morgan from "morgan";
import expHbs from "express-handlebars";
import path from "node:path";
import router from "./routers/home.js";
import authController from "./controllers/auth.controller.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser("secret-key"));
app.use(morgan("dev"));

const hbs = expHbs.create({
  extname: "hbs",
  // helpers,
  defaultLayout: "main",
  layoutsDir: path.join(process.cwd(), "src", "views", "layouts"),
  partialsDir: path.join(process.cwd(), "src", "views", "partials"),
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src", "views"));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/public", express.static(path.join(process.cwd(), "src", "public")));

connectDb()
  .then((res) => console.log(res))
  .catch((err) => console.log(err.message));

app.use("/", router);
app.use("/api", apiRouter);

// app.get("/", (req, res) => {
//   res.render("home")
// })

app.get("/register", (req, res) => {
  res.render("register", { cssFile: "auth" })
})

app.get("/login", (req, res) => {
  res.render("login", { cssFile: "auth" })
})

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
