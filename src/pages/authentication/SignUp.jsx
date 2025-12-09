import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerAPI } from "@/endpoints/authentication/RegisterAPI";
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
import { toast } from "react-toastify";

const SignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("auth.signup.passwordMismatch"));
      return;
    }

    setIsLoading(true);
    try {
      await registerAPI({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      toast.success(t("auth.signup.success"));
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || t("auth.signup.error");
      toast.error(message);
    } finally {
      setIsLoading(false);
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
          {t("auth.taglineSignup")}
        </p>
      </div>

      {/* SignUp Card */}
      <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center bg-linear-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
            {t("auth.signup.title")}
          </CardTitle>
          <CardDescription className="text-center text-base text-amber-700 dark:text-amber-300">
            {t("auth.signup.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  {t("auth.signup.firstName")}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder={t("auth.signup.firstNamePlaceholder")}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="h-11 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  {t("auth.signup.lastName")}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder={t("auth.signup.lastNamePlaceholder")}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="h-11 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-amber-950 dark:text-amber-50"
              >
                {t("auth.signup.email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("auth.signup.emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-amber-950 dark:text-amber-50"
              >
                {t("auth.signup.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
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
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                {t("auth.signup.passwordHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-amber-950 dark:text-amber-50"
              >
                {t("auth.signup.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 pr-10 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("auth.signup.submitting")}
                </div>
              ) : (
                t("auth.signup.submit")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="text-sm text-center text-amber-800 dark:text-amber-300">
            {t("auth.signup.hasAccount")}{" "}
            <a
              href="/login"
              className="font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400 underline underline-offset-4 transition-colors"
            >
              {t("auth.signup.loginLink")}
            </a>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default SignUp;
