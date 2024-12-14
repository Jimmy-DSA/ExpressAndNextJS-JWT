import dotenv from "dotenv";

dotenv.config();

export const config = {
  SECRET_KEY: process.env.JWT_SECRET || "test_jwt",
  SECRET_REFRESH_KEY: process.env.REFRESH_JWT_SECRET || "test_jwt",
  PORT: process.env.PORT || 3000,
  TOKEN_EXPIRATION: 50,
};
