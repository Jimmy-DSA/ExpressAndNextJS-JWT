import jwt from "jsonwebtoken";
import { config } from "../config/environment";

export const generateToken = (id: string, username: string) => {
  return jwt.sign({ id, username }, config.SECRET_KEY, {
    expiresIn: config.TOKEN_EXPIRATION,
  });
};

export const generateRefreshToken = (id: string, username: string) => {
  return jwt.sign({ id, username }, config.SECRET_REFRESH_KEY);
};

export const getTokenExpirationDate = (): string => {
  const now = new Date();
  return new Date(now.getTime() + config.TOKEN_EXPIRATION * 1000).toISOString();
};
