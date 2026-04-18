import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { UnauthorizedException } from "../exceptions/unauthorized.exception.js";

export const Protected = (isProtected = true) => {
  return (req, res, next) => {
    if (!isProtected) {
      req.user = { role: "VIEWER" };
      return next();
    }

    const { authorization } = req.headers;

    if (!authorization) {
      throw new BadRequestException("Token not given");
    }

    const token = authorization?.split(" ")[1];

    try {
      const payload = jwt.verify(token, jwtConfig.accessKey);

      req.user = payload;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException("Token already expired");
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException("JWT token is invalid");
      }

      next(error);
    }
  };
};
