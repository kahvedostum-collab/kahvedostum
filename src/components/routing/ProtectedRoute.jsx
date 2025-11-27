import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isLogged, isInitialized } = useAuth();
  const location = useLocation();

  // Auth durumu henüz belirlenmemişse hiçbir şey gösterme (flash önleme)
  if (!isInitialized) {
    return null;
  }

  // Giriş yapılmamışsa login sayfasına yönlendir
  if (!isLogged) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
