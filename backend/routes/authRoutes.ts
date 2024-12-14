import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  generateToken,
  generateRefreshToken,
  getTokenExpirationDate,
} from "../utils/tokenUtils";
import { userInterface } from "../types/user";
import { authMiddleware } from "../middlewares/authMiddleware";
import { config } from "../config/environment";
import { JwtPayloadCustom } from "../types/auth";
import jwt from "jsonwebtoken";
import { refreshTokens, users } from "../server";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "invalid credentials." });
    return;
  }

  const token = generateToken(user.id, user.username);
  const refreshToken = generateRefreshToken(user.id, user.username);

  refreshTokens[user.id] = refreshToken;

  res.json({
    token,
    refreshToken,
    tokenExpiresAt: getTokenExpirationDate(),
  });
});

router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "username or password missing." });
    return;
  }
  if (users.find((user) => user.username === username)) {
    res.status(400).json({ message: "username já existe." });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: Date.now().toString(), username, password: hashedPassword });

  res.status(201).json({ message: "user registered successfully." });
});

router.delete(
  "/api/users/:id",
  authMiddleware,
  (req: Request, res: Response) => {
    const userId = req.params.id;

    if (req.user?.id !== userId) {
      res.status(403).json({
        message: "You can only delete your own account.",
      });
      return;
    }

    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    users.splice(userIndex, 1);
    res.status(200).json({
      message: "User deleted successfully.",
    });
  }
);

router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const userId = Object.keys(refreshTokens).find(
    (id) => refreshTokens[id] === refreshToken
  );

  if (!userId) {
    res.status(403).json({ message: "invalid refresh token." });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      config.SECRET_REFRESH_KEY
    ) as JwtPayloadCustom;

    const newToken = generateToken(decoded.id, decoded.username);

    const newRefreshToken = generateRefreshToken(decoded.id, decoded.username);
    refreshTokens[userId] = newRefreshToken;

    const tokenExpirationDate = getTokenExpirationDate();

    res.json({
      token: newToken,
      expiresAt: tokenExpirationDate,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    res.status(403).json({ error: "invalid refresh token." });
  }
});

router.get("/welcome", authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: `Olá ${req.user?.username}, essa é uma rota protegida!`,
  });
});

export default router;
