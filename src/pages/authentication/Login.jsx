import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/shacdn/button";
import { Input } from "@/components/shacdn/input";
import { Label } from "@/components/shacdn/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shacdn/card";
import { LoginAPI } from "@/endpoints/authentication/LoginAPI";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogged } = useAuth();
  const { isLoading } = useSelector((state) => state.kahvedostumslice);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error(t("auth.login.validation.emailRequired"));
      return false;
    }

    if (!password) {
      toast.error(t("auth.login.validation.passwordRequired"));
      return false;
    }

    if (password.length < 6) {
      toast.error(t("auth.login.validation.passwordMinLength"));
      return false;
    }

    return true;
  };

  // Zaten giriş yapılmışsa dashboard'a yönlendir
  useEffect(() => {
    if (isLogged) {
      navigate("/");
    }
  }, [isLogged, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // unwrap() metodu thunk rejected olursa throw eder
      // Böylece catch bloğu hatayı yakalayabilir
      await dispatch(LoginAPI({ email, password })).unwrap();
      toast.success(t("auth.login.success"));
      navigate("/");
    } catch (err) {
      // rejectWithValue'dan gelen payload burada err olarak gelir
      const errorMessage = err?.error?.message || err?.message || t("auth.login.error");
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* Logo ve Başlık Alanı */}
      <div className="text-center mb-8 space-y-2">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-600 blur-2xl opacity-30 rounded-full"></div>
            <div className="relative bg-linear-to-r from-amber-600 to-amber-800 text-white p-6 rounded-2xl shadow-2xl">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Steam lines with animation */}
                <path
                  d="M7 2c0 1.5-.5 2.5-1 4"
                  className="animate-pulse"
                  style={{ animationDelay: "0s" }}
                  opacity="0.6"
                />
                <path
                  d="M12 2c0 1.5-.5 2.5-1 4"
                  className="animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                  opacity="0.8"
                />
                <path
                  d="M17 2c0 1.5-.5 2.5-1 4"
                  className="animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                  opacity="0.6"
                />
                {/* Cup body */}
                <path
                  d="M3 8h15v11a3 3 0 01-3 3H6a3 3 0 01-3-3V8z"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <path d="M3 8h15v11a3 3 0 01-3 3H6a3 3 0 01-3-3V8z" />
                {/* Handle */}
                <path d="M18 10h2a2 2 0 012 2v1a2 2 0 01-2 2h-2" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-linear-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">
          {t("auth.appName")}
        </h1>
        <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
          {t("auth.tagline")}
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center bg-linear-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
            {t("auth.login.title")}
          </CardTitle>
          <CardDescription className="text-center text-base text-amber-700 dark:text-amber-300">
            {t("auth.login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="text"
                className="text-sm font-semibold text-amber-950 dark:text-amber-50"
              >
                {t("auth.login.email")}
              </Label>
              <Input
                id="text"
                type="text"
                placeholder={t("auth.login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  {t("auth.login.password")}
                </Label>
                <a
                  href="/forgot-password"
                  className="text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors"
                >
                  {t("auth.login.forgotPassword")}
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-11 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("auth.login.submitting")}
                </div>
              ) : (
                t("auth.login.submit")
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="text-sm text-center text-amber-800 dark:text-amber-300">
            {t("auth.login.noAccount")}{" "}
            <a
              href="/signup"
              className="font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400 underline underline-offset-4 transition-colors"
            >
              {t("auth.login.signupLink")}
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Alt Bilgi */}
      <div className="mt-8 text-center text-xs text-amber-700 dark:text-amber-400 space-y-1">
        <p>{t("auth.footer.copyright")}</p>
        <div className="flex justify-center gap-4">
          <a
            href="#"
            className="hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
          >
            {t("auth.footer.privacy")}
          </a>
          <span>•</span>
          <a
            href="#"
            className="hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
          >
            {t("auth.footer.terms")}
          </a>
        </div>
      </div>
    </>
  );
};

export default Login;
