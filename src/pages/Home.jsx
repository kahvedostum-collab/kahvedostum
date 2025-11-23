import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Navigate } from "react-router";

const Home = () => {
  const { isLogged, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return isLogged ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

export default Home;
