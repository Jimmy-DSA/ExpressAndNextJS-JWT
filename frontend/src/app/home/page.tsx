import React from "react";
import Greetings from "../components/home/Greetings";
import LogoutButton from "../components/home/LogoutButton";
import { AuthProvider } from "../contexts/authContext";
import ExpiredSessionModal from "../components/home/ExpiredSessionModal";

function Home() {
  return (
    <AuthProvider>
      <div className="p-4 flex flex-col h-lvh w-full">
        <div className="flex justify-between items-center">
          <div className="text-3xl font-bold">Home</div>
          <LogoutButton></LogoutButton>
        </div>
        <Greetings></Greetings>
        <div className="flex-grow"></div>
        <ExpiredSessionModal></ExpiredSessionModal>
      </div>
    </AuthProvider>
  );
}

export default Home;
