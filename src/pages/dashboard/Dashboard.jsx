import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/shacdn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shacdn/card";
import DefaultLayout from "@/layout/DefaultLayout";

const Dashboard = () => {
  const { userDetails, logout } = useAuth();

  return (
    <DefaultLayout>
      <div className="w-full bg-amber-400 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-amber-400">Dashboard</h1>
              <p className="text-amber-700 dark:text-amber-400 mt-1">
                Hoş geldiniz! Kahve dolu bir gün dileriz ☕
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-950 font-semibold transition-all duration-200"
            >
              Çıkış Yap
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-amber-200 dark:border-amber-900 shadow-lg bg-white/95 dark:bg-zinc-900/95">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  Toplam Kahve
                </CardTitle>
                <CardDescription>Bu ay içilen kahve sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-amber-900 dark:text-amber-300">
                  42
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 dark:border-amber-900 shadow-lg bg-white/95 dark:bg-zinc-900/95">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  Favori Kahve
                </CardTitle>
                <CardDescription>En çok tercih edilen</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                  Türk Kahvesi
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 dark:border-amber-900 shadow-lg bg-white/95 dark:bg-zinc-900/95">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  Puan
                </CardTitle>
                <CardDescription>Toplam kazanılan puan</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-amber-900 dark:text-amber-300">
                  1,250
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Info Card */}
          {userDetails && (
            <Card className="border-2 border-amber-200 dark:border-amber-900 shadow-lg bg-white/95 dark:bg-zinc-900/95">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  Kullanıcı Bilgileri
                </CardTitle>
                <CardDescription>
                  Hesap detayları ve oturum bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-amber-50 dark:bg-zinc-950 rounded-lg text-sm overflow-x-auto border border-amber-200 dark:border-amber-900">
                  {JSON.stringify(userDetails, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
