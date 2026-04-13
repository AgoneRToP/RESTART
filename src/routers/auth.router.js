import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter
  .post("/register", AuthController.register)
  .post("/login", AuthController.login)
  .post("/logout", AuthController.logout)
  .post("/refresh", AuthController.refresh)
  .post("/forgot_password", AuthController.forgotPassword)
  .post("/reset_password", AuthController.resetPassword);

export default authRouter;
