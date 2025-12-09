import React, { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { resetInitialState, setIsLogged, setIsInitialized } from "@/slice/KDSlice";
import { toast } from "react-toastify";
import {
  AUTH_EVENTS,
  isAuthenticated,
  clearTokens,
  subscribeToAuthEvents,
} from "@/services/authService";
import { logoutAPI } from "@/endpoints/authentication/LogoutAPI";

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

  // Use ref to track isLogged without causing re-registration of event listener
  const isLoggedRef = useRef(isLogged);
  useEffect(() => {
    isLoggedRef.current = isLogged;
  }, [isLogged]);

  // localStorage değişikliklerini dinle (farklı tab/window için)
  // Using ref pattern to avoid memory leak from event listener re-registration
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" && !e.newValue && isLoggedRef.current) {
        dispatch(resetInitialState());
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    try {
      await logoutAPI();
    } finally {
      // API başarısız olsa bile local temizlik yap
      dispatch(resetInitialState());
      clearTokens();
      toast.success("Başarıyla çıkış yapıldı.");
    }
  }, [dispatch]);

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

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
