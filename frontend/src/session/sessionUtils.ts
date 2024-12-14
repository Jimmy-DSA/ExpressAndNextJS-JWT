import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type User = {
  id: string;
  username: string;
};

const secret = "12345678901234567890123456789012"; //env var
const ttl = 60 * 60 * 24 * 7;

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<{
    token: string;
    expiresAt: string;
    refreshToken: string;
  }>(cookieStore, {
    password: secret,
    cookieName: "auth",
    ttl,
    cookieOptions: {
      httpOnly: true,
      secure: false, // set this to false in local (non-HTTPS) development
      sameSite: "lax", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#lax
      maxAge: (ttl === 0 ? 2147483647 : ttl) - 60, // Expire cookie before the session expires.
      path: "/",
    },
  });
}

export async function saveSession(
  token: string,
  expiresAt: string,
  refreshToken: string
) {
  const session = await getSession();
  const decoded = jwt.verify(token, "test_jwt") as {
    id: string;
    username: string;
  };
  const userData = JSON.stringify({
    id: decoded.id,
    username: decoded.username,
  });

  const cookieStore = await cookies();
  cookieStore.set("user_data", userData, {
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  session.token = token;
  session.refreshToken = refreshToken;
  session.expiresAt = expiresAt;
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
  const cookieStore = await cookies();
  cookieStore.delete("user_data");
}
