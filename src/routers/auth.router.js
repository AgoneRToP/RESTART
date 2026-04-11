import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter
    .post("/login", authController().login)
    .post("/register", authController().register)
    .post("/forgot_password", authController().forgotPassword)
    .post("/reset_password", authController().resetPassword)

export default authRouter