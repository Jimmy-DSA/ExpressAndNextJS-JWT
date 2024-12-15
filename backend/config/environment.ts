import dotenv from "dotenv";

dotenv.config();

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in the environment variables");
}
if (!process.env.REFRESH_SECRET_KEY) {
  throw new Error("REFRESH_KEY is not defined in the environment variables");
}

export const config = {
  SECRET_KEY: process.env.SECRET_KEY,
  SECRET_REFRESH_KEY: process.env.REFRESH_SECRET_KEY,
  PORT: process.env.PORT || 3000,
  TOKEN_EXPIRATION: 50, // expiration in seconds
};
