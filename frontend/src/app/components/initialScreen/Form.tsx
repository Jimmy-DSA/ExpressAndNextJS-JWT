"use client";

import { loginAction } from "@/app/loginAction";
import React, { useActionState, useState } from "react";

const initialState = {
  errors: "",
};

function Form() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form className="m-4 border  rounded-lg p-4" action={formAction}>
      <h1 className="text-2xl font-bold">
        {mode === "login" ? "Login" : "Registrar"}
      </h1>
      <div className="relative">
        <label className="block">username</label>
        <input type="text" name="username" className="border p-2 w-full" />
        {state.formDataErrors?.username && (
          <div className="absolute">{state.formDataErrors.username[0]}</div>
        )}
      </div>

      <div>
        <label className="block">password</label>
        <input type="password" name="password" className="border p-2 w-full" />
      </div>
      <div className="w-full flex items-center justify-center mt-3">
        <button
          disabled={pending}
          className={`${
            pending ? "bg-gray-300" : "bg-blue-500"
          } w-full text-white p-2 rounded-md`}
        >
          {mode === "login" ? "Login" : "Registrar"}
        </button>
      </div>
      <div className="block mt-1">
        <span className="text-sm">
          {mode === "login" ? "Tem uma conta? " : "Não tem uma conta? "}
        </span>
        <a
          className="text-sm text-blue-500 underline cursor-pointer"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Login" : "Registrar"}
        </a>
      </div>
      {state.errors && (
        <span className="block text-red-500 text-sm mt-4">{state.errors}</span>
      )}
    </form>
  );
}

export default Form;
