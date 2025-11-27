import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Navigate } from "react-router";

const Home = () => {
  const { isLogged, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
        <p className="text-amber-800 dark:text-amber-200">Yükleniyor...</p>
      </div>
    );
  }

  return isLogged ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

export default Home;
