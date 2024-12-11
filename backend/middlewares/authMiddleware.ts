import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { JwtPayloadCustom } from "../types/auth";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "no token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.SECRET_KEY) as JwtPayloadCustom;

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        error: "token expired.",
      });
      return;
    }
    console.log(error);
    res.status(403).json({
      message: "invalid token.",
    });
  }
};
