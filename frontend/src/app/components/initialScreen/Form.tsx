"use client";

import { loginAction } from "@/app/authActions";
import React, { useActionState, useRef, useState } from "react";
import { z } from "zod";
import { config } from "../../config";

const initialState = {
  errors: "",
  username: "",
  password: "",
};

function Form() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );
  const [registerPending, setRegisterPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [registerErrors, setRegisterErrors] = useState<{
    errors?: string;
    username?: string[];
    password?: string[];
  }>();

  const [successMessage, setSuccessMessage] = useState<string | undefined>();

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

  const registerAction = async () => {
    if (!formRef.current) {
      console.log("without formRef");
      return;
    }
    setSuccessMessage(undefined);
    setRegisterErrors(undefined);
    setRegisterPending(true);

    const formData = new FormData(formRef.current);

    const { username, password } = Object.fromEntries(formData);
    const validatedFields = schema.safeParse({
      username: username,
      password: password,
    });
    if (!validatedFields.success) {
      setRegisterErrors(validatedFields.error.flatten().fieldErrors);
      setRegisterPending(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Erro:", data.message);
        setRegisterErrors({ errors: data.message });
      } else {
        console.log("data:", data);
        formRef.current.reset();
        setSuccessMessage("registrado com sucesso");
      }
    } catch (e) {
      if (e instanceof Error) {
        console.log("here");
        setRegisterErrors({ errors: e.message || "erro ao registrar" });
      }
    } finally {
      setRegisterPending(false);
    }

    setRegisterPending(false);
  };

  return (
    <form
      ref={formRef}
      className="m-4 border  rounded-lg p-4"
      action={mode === "login" ? formAction : undefined}
      onSubmit={(e) => {
        if (mode === "register") {
          e.preventDefault();
          registerAction();
        } else {
          (() => {})();
        }
      }}
    >
      <h1 className="text-2xl font-bold">
        {mode === "login" ? "Login" : "Registrar"}
      </h1>
      <div className="relative">
        <label className="block">username</label>
        <input
          type="text"
          name="username"
          defaultValue={mode === "login" ? state.username : undefined}
          className="border p-2 w-full"
        />
        {(state.formDataErrors?.username || registerErrors?.username) && (
          <div
            className="absolute"
            style={{
              top: 0,
              left: 94,
              width: 150,
              fontSize: 10,
              backgroundColor: "red",
              color: "white",
              borderRadius: 5,
              padding: "5px 10px",
              lineHeight: "10px",
              textAlign: "center",
            }}
          >
            {state?.formDataErrors?.username?.[0] ?? registerErrors?.username}
          </div>
        )}
      </div>

      <div>
        <label className="block">password</label>
        <input
          type="password"
          name="password"
          defaultValue={mode === "login" ? state.username : undefined}
          className="border p-2 w-full"
        />
      </div>
      <div className="w-full flex items-center justify-center mt-3">
        <button
          disabled={pending || registerPending}
          className={`${
            pending || registerPending ? "bg-gray-300" : "bg-blue-500"
          } w-full text-white p-2 rounded-md`}
        >
          {mode === "login" ? "Login" : "Registrar"}
        </button>
      </div>
      <div className="block mt-1">
        <span className="text-sm">
          {mode === "login" ? "Não tem uma conta? " : "Tem uma conta? "}
        </span>
        <a
          className="text-sm text-blue-500 underline cursor-pointer"
          onClick={() => {
            state.formDataErrors = undefined;
            setRegisterErrors(undefined);
            setSuccessMessage(undefined);
            setMode(mode === "login" ? "register" : "login");
          }}
        >
          {mode === "login" ? "Registrar" : "Login"}
        </a>
      </div>
      {state.errors ||
        (registerErrors?.errors && (
          <span className="block text-red-500 text-sm mt-3 text-center">
            {state.errors || registerErrors.errors}
          </span>
        ))}
      {successMessage && (
        <span className="block text-green-500 text-sm mt-3 text-center">
          {successMessage}
        </span>
      )}
    </form>
  );
}

export default Form;
