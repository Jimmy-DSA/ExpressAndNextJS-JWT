import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type User = {
  id: string;
  username: string;
};

if (!process.env.MODE) {
  throw new Error("MODE is not defined in the environment variables");
}

if (!process.env.NEXT_PUBLIC_API) {
  throw new Error("API is not defined in the environment variables");
}

export async function getSession() {
  if (!process.env.SESSION_COOKIE_KEY) {
    throw new Error(
      "SESSION_COOKIE_KEY is not defined in the environment variables"
    );
  }

  const cookieStore = await cookies();
  return getIronSession<{
    token: string;
    expiresAt: string;
    refreshToken: string;
  }>(cookieStore, {
    password: process.env.SESSION_COOKIE_KEY,
    cookieName: "auth",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.MODE === "development" ? false : true, // set this to false in local (non-HTTPS) development
      sameSite: "lax", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#lax

      path: "/",
    },
  });
}

export async function saveSession(
  token: string,
  expiresAt: string,
  refreshToken: string
) {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in the environment variables");
  }
  const session = await getSession();
  const decoded = jwt.verify(token, process.env.SECRET_KEY) as {
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
