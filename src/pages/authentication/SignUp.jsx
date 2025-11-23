import React, { useState } from "react";
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

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return;
    }
    if (!acceptTerms) {
      alert("Lütfen kullanım koşullarını kabul edin!");
      return;
    }
    setIsLoading(true);
    // SignUp logic burada implement edilecek
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-900 dark:via-amber-950 dark:to-zinc-900 p-4">
      {/* Kahve Desenli Arka Plan */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo ve Başlık Alanı */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-600 blur-2xl opacity-30 rounded-full"></div>
              <div className="relative bg-linear-to-br from-amber-600 to-amber-800 text-white p-6 rounded-2xl shadow-2xl">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">
            Kahvedostum
          </h1>
          <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
            Kahve Ailesine Katılın ☕
          </p>
        </div>

        {/* SignUp Card */}
        <Card className="border-2 border-amber-200 dark:border-amber-900 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center bg-linear-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
              Hesap Oluşturun
            </CardTitle>
            <CardDescription className="text-center text-base">
              Kahve tutkunları topluluğuna ücretsiz katılın
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
                    Ad
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Ahmet"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="h-11 border-amber-300 dark:border-amber-800 focus:border-amber-600 focus:ring-amber-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                  >
                    Soyad
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Yılmaz"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="h-11 border-amber-300 dark:border-amber-800 focus:border-amber-600 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  E-posta
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@kahvedostum.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 border-amber-300 dark:border-amber-800 focus:border-amber-600 focus:ring-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  Şifre
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 border-amber-300 dark:border-amber-800 focus:border-amber-600 focus:ring-amber-600"
                />
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  En az 8 karakter olmalıdır
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-amber-950 dark:text-amber-50"
                >
                  Şifre Tekrar
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 border-amber-300 dark:border-amber-800 focus:border-amber-600 focus:ring-amber-600"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Hesap oluşturuluyor...
                  </div>
                ) : (
                  "Hesap Oluştur"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-6">
            <div className="text-sm text-center text-amber-800 dark:text-amber-300">
              Zaten hesabınız var mı?{" "}
              <a
                href="/login"
                className="font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400 underline underline-offset-4 transition-colors"
              >
                Giriş Yapın
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
