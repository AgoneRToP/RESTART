import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";
import { signature } from "../configs/signature.config.js";
import { config } from "dotenv";
import { BadRequestException } from "../exceptions/bad-request.exception.js"; // 400
import { PaymentRequiredException } from "../exceptions/payment-required.exception.js"; //402
import { ForbiddenException } from "../exceptions/forbidden.exception.js"; // 403
import { NotFoundException } from "../exceptions/not-found.exception.js"; // 404
import { ConflictException } from "../exceptions/conflict.exception.js"; // 409

config({ quiet: true });

const BASE_URL = process.env.BASE_URL;

class AuthController {
  #_userModel;
  constructor() {
    this.#_userModel = User;
  }

  register = async (req, res, next) => {
    try {
      const { name, username, email, age, password } = req.body;

      const existing = await this.#_userModel.findOne({ email });

      if (existing) {
        throw new ConflictException(`Given email: ${email} already in use`);
      }

      const hashedPass = await this.#_hashPass(password);

      const user = await this.#_userModel.create({
        email,
        name,
        username,
        age,
        password: hashedPass,
      });

      const accessToken = this.#_generateAccessToken({ id: user._id });
      const refreshToken = this.#_generateRefreshToken({ id: user._id });

      res.cookie("accessToken", accessToken, {
        signed: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        signed: true,
        httpOnly: true,
        maxAge: 10000,
      });

      console.log({
        success: true,
        data: {
          accessToken,
          refreshToken,
          userId: user._id,
        },
      });
      res.redirect("/")
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existing = await this.#_userModel.findOne({ email });

      if (!existing) {
        throw new NotFoundException("User not found");
      }

      const comparePass = await this.#_comparePass(password, existing.password);

      if (!comparePass) {
        throw new ConflictException("Password is invalid");
      }

      const accessToken = this.#_generateAccessToken({ id: existing._id });
      const refreshToken = this.#_generateRefreshToken({ id: existing._id });

      res.cookie("accessToken", accessToken, {
        signed: true,
        expires: new Date(Date.now() + 5000),
      });
      res.cookie("refreshToken", refreshToken, {
        signed: true,
        expires: new Date(Date.now() + 10000),
      });

      // logger.info(`User logged in successfully: ${email} (ID: ${existing._id})`); 

      console.log({
        success: true,
        data: {
          accessToken,
          refreshToken,
          userId: existing._id,
        },
      });
      res.redirect("/")

    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const cookieOptions = {
        signed: true,
        httpOnly: true,
      };

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);

      res.send({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestException("Token not given");
      }

      const payload = jwt.verify(
        refreshToken,
        jwtConfig.REFRESH_TOKEN_SECRET_KEY,
      );

      const accessToken = this.#_generateAccessToken({
        id: payload.id,
        role: payload.role,
      });

      res.send({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    const existing = await this.#_userModel.findOne({ email });

    if (!existing) {
      throw new NotFoundException("User not found");
    }

    const signedUrl = signature.sign(
      `${BASE_URL}/api/auth/reset-password?userId=${existing._id}`,
      {
        ttl: 300,
      },
    );

    res.send({
      success: true,
      data: {
        signedUrl,
      },
    });
  };

  resetPassword = async (req, res, next) => {
    try {
      const { userId } = req.query;
      const { password } = req.body;

      const isValid = signature.verify(req.originalUrl);

      if (!isValid) {
        logger.error(`Failed password reset attempt for user: ${userId}`);
        throw new ForbiddenException("Link expired or invalid");
      }

      const hashedPass = await this.#_hashPass(password);

      await this.#_userModel.updateOne(
        { _id: userId },
        { $set: { password: hashedPass } },
      );

      res.send({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  #_hashPass = async (pass) => {
    const hashed = await bcrypt.hash(pass, 10);
    return hashed;
  };

  #_comparePass = async (originalPass, hashedPass) => {
    const isSame = await bcrypt.compare(originalPass, hashedPass);

    return isSame;
  };

  #_generateAccessToken = (payload) => {
    const token = jwt.sign(payload, jwtConfig.accessKey, {
      expiresIn: jwtConfig.accessExpireTime,
    });

    return token;
  };

  #_generateRefreshToken = (payload) => {
    const token = jwt.sign(payload, jwtConfig.refreshKey, {
      expiresIn: jwtConfig.refreshExpireTime,
    });

    return token;
  };
}

export default new AuthController();
