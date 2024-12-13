"use server";

import { saveSession } from "@/session/sessionUtils";
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

export const loginAction = async (prevState: unknown, formData: FormData) => {
  prevState = undefined;
  const validatedFields = schema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      formDataErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { username, password } = Object.fromEntries(formData);

  const response = await fetch(`http://localhost:3000/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return {
      errors: "password ou username incorretos",
    };
  } else {
    const parsedResponse = await response.json();
    console.log(parsedResponse);
    const { token } = parsedResponse;
    await saveSession(token);
    redirect("/home");
  }
};
