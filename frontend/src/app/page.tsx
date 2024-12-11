"use client";

import { useState } from "react";
import { loginAction } from "./loginAction";

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <div className="flex grow min-h-lvh items-center justify-center">
      <form className="m-4 border  rounded-lg p-4" action={loginAction}>
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Login" : "Registrar"}
        </h1>
        <div>
          <label className="block">username</label>
          <input type="text" name="username" className="border p-2 w-full" />
        </div>

        <div>
          <label className="block">password</label>
          <input
            type="password"
            name="password"
            className="border p-2 w-full"
          />
        </div>
        <div className="w-full flex items-center justify-center mt-3">
          <button className="bg-blue-500 w-full text-white p-2 rounded-md ">
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
      </form>
    </div>
  );
}
