"use client";

import { logoutAction } from "@/app/authActions";
import React, { useState } from "react";
import { redirect } from "next/navigation";

const LogoutButton = () => {
  const [locked, setLocked] = useState(false);

  const Logout = async () => {
    if (locked) {
      return;
    }
    setLocked(true);
    await logoutAction();
    redirect("/");
  };

  return (
    <div
      onClick={Logout}
      className="flex justify-center items-center cursor-pointer"
    >
      <div className="py-2 px-4 bg-blue-500 text-white inline-block rounded-md">
        Logout
      </div>
    </div>
  );
};

export default LogoutButton;
