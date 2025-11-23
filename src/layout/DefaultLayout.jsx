import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";

const DefaultLayout = ({ children }) => {
  const { isLogged, logout } = useAuth();

  useEffect(() => {
    if (!isLogged) {
      logout();
    }
  }, [isLogged]);

  return <div className="min-h-screen min-w-full flex">{children}</div>;
};

export default DefaultLayout;
