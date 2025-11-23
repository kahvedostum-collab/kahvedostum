import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetInitialState, setIsLogged } from "@/slice/KDSlice";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogged, isLoading } = useSelector(
    (state) => state.kahvedostumslice
  );

  // Token kontrolü - uygulama yüklendiğinde
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken && !isLogged) {
      dispatch(setIsLogged(true));
    } else if (!accessToken && isLogged) {
      // Token silinmişse logout yap
      dispatch(resetInitialState());
      navigate("/login");
    }
  }, [dispatch, isLogged, navigate]);

  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = (e) => {
      // accessToken silindiğinde veya değiştiğinde
      if (e.key === "accessToken" && !e.newValue && isLogged) {
        dispatch(resetInitialState());
        navigate("/login");
      }
    };

    // storage event'ini dinle (farklı tab/window için)
    window.addEventListener("storage", handleStorageChange);

    // Aynı tab için interval ile kontrol
    const intervalId = setInterval(() => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken && isLogged) {
        dispatch(resetInitialState());
        navigate("/login");
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [dispatch, isLogged, navigate]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(resetInitialState());
    toast.success("Başarıyla çıkış yapıldı.");
    navigate("/login");
  };

  const value = {
    isLogged,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
