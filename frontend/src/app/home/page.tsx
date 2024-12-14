import React from "react";
import Greetings from "../components/home/Greetings";
import LogoutButton from "../components/home/LogoutButton";
import { AuthProvider } from "../contexts/authContext";
import ExpiredSessionModal from "../components/home/ExpiredSessionModal";

function Home() {
  return (
    <AuthProvider>
      <div className="p-4 flex flex-col h-lvh w-full">
        <div className="text-3xl font-bold">Home</div>
        <Greetings></Greetings>
        <div className="flex-grow"></div>
        <div className="mt-5">
          <LogoutButton></LogoutButton>
        </div>
        <ExpiredSessionModal></ExpiredSessionModal>
      </div>
    </AuthProvider>
  );
}

export default Home;
