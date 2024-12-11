import express from "express";
import { Express } from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/environment";
import { JwtPayloadCustom } from "./types/auth";
import authRoutes from "./routes/authRoutes";
import { userInterface } from "./types/user";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayloadCustom;
  }
}

const server: Express = express();
server.use(cors());
server.use(express.json());
server.use(morgan("dev"));

export let users: userInterface[];

(async () => {
  const hashedPassword = await bcrypt.hash("password1", 10);
  users = [
    {
      id: "gfdffgdfgfgfg",
      username: "user1",
      password: hashedPassword,
    },
  ];
})();

export const refreshTokens: { [key: string]: string } = {};

server.use("/auth", authRoutes);

server.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
