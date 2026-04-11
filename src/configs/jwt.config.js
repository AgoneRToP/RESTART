import { config } from "dotenv";

config({ quiet: true });

export default {
  accessKey: process.env.ACCESS_TOKEN_SECRET_KEY,
  accessExpireTime: process.env.ACCESS_TOKEN_EXPIRE_TIME
    ? Number(process.env.ACCESS_TOKEN_EXPIRE_TIME)
    : 300,
  refreshKey: process.env.REFRESH_TOKEN_SECRET_KEY,
  refreshExpireTime: process.env.REFRESH_TOKEN_EXPIRE_TIME,
};
