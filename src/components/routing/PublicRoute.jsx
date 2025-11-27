import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { isLogged, isInitialized } = useAuth();

  // Auth durumu henüz belirlenmemişse hiçbir şey gösterme
  if (!isInitialized) {
    return null;
  }

  // Zaten giriş yapmışsa dashboard'a yönlendir
  if (isLogged) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
