import { Router } from "express";
import authRouter from "./auth.router.js";
import postRouter from "./post.router.js";

const apiRouter = Router()

apiRouter.use("/auth", authRouter).use("/post", postRouter)

export default apiRouter