import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetInitialState, setIsLogged, setIsInitialized } from "@/slice/KDSlice";
import { toast } from "react-toastify";
import {
  AUTH_EVENTS,
  isAuthenticated,
  clearTokens,
  subscribeToAuthEvents,
} from "@/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogged, isLoading, isInitialized } = useSelector(
    (state) => state.kahvedostumslice
  );

  // İlk yükleme - Token kontrolü (bir kez çalışır)
  useEffect(() => {
    const hasToken = isAuthenticated();
    dispatch(setIsLogged(hasToken));
    dispatch(setIsInitialized(true));
  }, [dispatch]);

  // authService event'lerine subscribe ol
  useEffect(() => {
    const unsubLogin = subscribeToAuthEvents(AUTH_EVENTS.LOGIN, () => {
      dispatch(setIsLogged(true));
    });

    const unsubLogout = subscribeToAuthEvents(AUTH_EVENTS.LOGOUT, () => {
      dispatch(resetInitialState());
      navigate("/login");
    });

    return () => {
      unsubLogin();
      unsubLogout();
    };
  }, [dispatch, navigate]);

  // localStorage değişikliklerini dinle (farklı tab/window için)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" && !e.newValue && isLogged) {
        dispatch(resetInitialState());
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch, isLogged, navigate]);

  const logout = useCallback(() => {
    clearTokens();
    toast.success("Başarıyla çıkış yapıldı.");
  }, []);

  const value = {
    isLogged,
    isLoading: isLoading || !isInitialized,
    isInitialized,
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
