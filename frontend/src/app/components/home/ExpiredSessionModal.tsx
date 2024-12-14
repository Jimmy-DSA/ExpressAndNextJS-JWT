"use client";

import React from "react";
import { useAuth } from "@/app/contexts/authContext";
import { redirect } from "next/navigation";

const ExpiredSessionModal = () => {
  //const router = useRouter();
  const { showSessionExpiredModal } = useAuth();
  const onConfirm = () => {
    redirect("/");
  };
  return (
    showSessionExpiredModal && (
      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50  backdrop-blur-lg">
        <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
          <h2 className="text-orange-500 font-semibold">Sessão Expirada</h2>
          <p>Sua sessão expirou.</p>
          <button
            style={{
              display: "inline-block",
              backgroundColor: "orange",
              borderRadius: 10,
              padding: "4px 10px",
              color: "white",
              fontSize: 15,
              marginTop: 13,
              boxShadow: "inset 0 0 0 2px #ffffff",
              outline: "2px solid orange",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={onConfirm}
          >
            ok
          </button>
        </div>
      </div>
    )
  );
};

export default ExpiredSessionModal;
