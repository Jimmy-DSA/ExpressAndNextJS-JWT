"use server";

import {
  destroySession,
  getSession,
  saveSession,
} from "@/session/sessionUtils";
import { redirect } from "next/navigation";

import { z } from "zod";

const schema = z.object({
  username: z
    .string({
      invalid_type_error: "Nome inválido",
    })
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres")
    .max(20, "O nome de usuário pode ter no máximo 20 caracteres"),

  password: z.string({
    invalid_type_error: "Senha inválida",
  }),
});

export const refreshExpiredToken = async (): Promise<boolean> => {
  console.log("()=>refreshExpiredToken");
  try {
    const session = await getSession();
    const storedRefreshToken = session.refreshToken;
    console.log("prev refresh token:", storedRefreshToken);

    try {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: storedRefreshToken,
          }),
        }
      );

      if (!refreshResponse.ok) {
        console.log("refresh wrent wrong");
        await destroySession();
        return false;
      }

      const data = await refreshResponse.json();
      const { token, expiresAt, refreshToken } = data;
      console.log("new refresh token:", refreshToken);
      await saveSession(token, expiresAt, refreshToken);
      return true;
    } catch (e: unknown) {
      console.log(e);
      await destroySession();
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar ou atualizar o token:", error);
    await destroySession();
    return false;
  }
};

export const loginAction = async (prevState: unknown, formData: FormData) => {
  console.log("loginAction()");
  prevState = undefined;
  const { username, password } = Object.fromEntries(formData);
  const validatedFields = schema.safeParse({
    username: username,
    password: password,
  });

  if (!validatedFields.success) {
    return {
      formDataErrors: validatedFields.error.flatten().fieldErrors,
      username: username.toString(),
      password: password.toString(),
    };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return {
      errors: "password ou username incorretos",
      username: username.toString(),
      password: password.toString(),
    };
  } else {
    const parsedResponse = await response.json();
    console.log(parsedResponse);
    const { token, tokenExpiresAt, refreshToken } = parsedResponse;
    await saveSession(token, tokenExpiresAt, refreshToken);
    redirect("/home");
  }
};

export const getSessionClientSide = async () => {
  const session = await getSession();
  return {
    token: session.token,
    expiresAt: session.expiresAt,
    refreshToken: session.refreshToken,
  };
};

export const logoutAction = async () => {
  await destroySession();
};
