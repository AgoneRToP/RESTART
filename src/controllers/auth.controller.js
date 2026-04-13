import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";
import { signature } from "../configs/signature.config.js";
import { config } from "dotenv";

config({ quiet: true });

const BASE_URL = process.env.BASE_URL;

class AuthController {
  #_userModel;
  constructor() {
    this.#_userModel = User;
  }

  register = async (req, res, next) => {
    const { name, email, age, password } = req.body;

    const existing = await this.#_userModel.findOne({ email });

    if (existing) {
      return res.status(409).send({
        sucess: false,
        message: `Given email: ${email} already in use`,
      });
    }

    const hashedPass = await this.#_hashPass(password);

    const user = await this.#_userModel.insertOne({
      email,
      name,
      age,
      password: hashedPass,
    });

    const accessToken = this.#_generateAccessToken({ id: user._id });
    const refreshToken = this.#_generateRefreshToken({ id: user._id });

    res.send({
      success: true,
      data: {
        accessToken,
        refreshToken,
        userId: user._id,
      },
    });
  };

  login = async (req, res, next) => {
    const { email, password } = req.body;

    const existing = await this.#_userModel.findOne({ email });

    if (!existing) {
      return res.status(409).send({
        sucess: false,
        message: `User not found`,
      });
    }

    const comparePass = await this.#_comparePass(password, existing.password);

    if (!comparePass) {
      return res.status(409).send({
        success: false,
        message: "Password is invalid",
      });
    }

    const accessToken = this.#_generateAccessToken({ id: existing._id });
    const refreshToken = this.#_generateRefreshToken({ id: existing._id });

    res.send({
      success: true,
      data: {
        accessToken,
        refreshToken,
        userId: existing._id,
      },
    });
  };

  refresh = async (req, res, next) => {};

  forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    const existing = await this.#_userModel.findOne({ email });

    if (!existing) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
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

  resetPassword = async (req, res, next) => {};

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
