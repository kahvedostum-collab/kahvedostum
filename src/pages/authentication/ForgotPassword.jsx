import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound } from "lucide-react";
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

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const hasToken = Boolean(token);

  // Request mode state (no token)
  const [identifier, setIdentifier] = useState("");

  // Reset mode state (with token)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Request mode - send reset link
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Fake API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation - empty check
    if (!identifier.trim()) {
      toast.error(t("auth.forgotPassword.emptyIdentifier"));
      setIsLoading(false);
      return;
    }

    // Mock: User not found simulation
    if (identifier === "notfound") {
      toast.error(t("auth.forgotPassword.userNotFound"));
      setIsLoading(false);
      return;
    }

    toast.success(t("auth.forgotPassword.emailSent"));
    setIsLoading(false);
  };

  // Reset mode - update password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Fake API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (newPassword !== confirmPassword) {
      toast.error(t("auth.forgotPassword.passwordMismatch"));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("auth.forgotPassword.passwordTooShort"));
      setIsLoading(false);
      return;
    }

    // Mock: Invalid token simulation
    if (token === "invalid") {
      toast.error(t("auth.forgotPassword.invalidToken"));
      setIsLoading(false);
      return;
    }

    toast.success(t("auth.forgotPassword.passwordUpdated"));
    navigate("/login");
  };

  return (
    <>
      {/* Logo ve Baslik Alani */}
      <div className="text-center mb-8 space-y-2">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-600 blur-2xl opacity-30 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-amber-600 to-amber-800 text-white p-6 rounded-2xl shadow-2xl">
              {hasToken ? (
                <KeyRound className="w-12 h-12" />
              ) : (
                <Mail className="w-12 h-12" />
              )}
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">
          {t("auth.appName")}
        </h1>
        <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
          {hasToken
            ? t("auth.forgotPassword.resetSubtitle")
            : t("auth.forgotPassword.subtitle")}
        </p>
      </div>

      {/* Forgot Password Card */}
      <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
            {hasToken
              ? t("auth.forgotPassword.resetTitle")
              : t("auth.forgotPassword.title")}
          </CardTitle>
          <CardDescription className="text-center text-base text-amber-700 dark:text-amber-300">
            {hasToken
              ? t("auth.forgotPassword.resetSubtitle")
              : t("auth.forgotPassword.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasToken ? (
            // Request Reset Form
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="identifier"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  {t("auth.forgotPassword.identifier")}
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder={t("auth.forgotPassword.identifierPlaceholder")}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="h-11 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("auth.forgotPassword.sending")}
                  </div>
                ) : (
                  t("auth.forgotPassword.sendLink")
                )}
              </Button>
            </form>
          ) : (
            // Reset Password Form
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  {t("auth.forgotPassword.newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t("auth.forgotPassword.passwordPlaceholder")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-11 pr-10 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {t("auth.forgotPassword.passwordHint")}
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  {t("auth.forgotPassword.confirmPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("auth.forgotPassword.passwordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-11 pr-10 border-amber-300 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("auth.forgotPassword.updating")}
                  </div>
                ) : (
                  t("auth.forgotPassword.updatePassword")
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <a
            href="/login"
            className="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.forgotPassword.backToLogin")}
          </a>
        </CardFooter>
      </Card>
    </>
  );
};

export default ForgotPassword;
