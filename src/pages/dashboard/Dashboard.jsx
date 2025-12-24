import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shacdn/card";
import { Badge } from "@/components/shacdn/badge";
import { Button } from "@/components/shacdn/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/shacdn/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Coffee,
  Trophy,
  TrendingUp,
  Camera,
  Clock,
  ArrowRight,
} from "lucide-react";
import DefaultLayout from "@/layout/DefaultLayout";
import { CameraModal } from "@/components/dashboard/CameraModal";
import { fetchFriends } from "@/endpoints/friends/FriendsAPI";
import { fetchIncomingRequests } from "@/endpoints/friends/FriendRequestsAPI";
import { setCafeSession } from "@/slice/KDSlice";
import {
  loadCafeSession,
  isSessionExpired,
  getSessionTimeRemaining,
} from "@/services/cafeStorageService";

// Fake data for charts
const monthlyData = [
  { month: "Oca", coffee: 38 },
  { month: "Şub", coffee: 42 },
  { month: "Mar", coffee: 35 },
  { month: "Nis", coffee: 48 },
  { month: "May", coffee: 52 },
  { month: "Haz", coffee: 42 },
];

const coffeeTypes = [
  { type: "Türk Kahvesi", count: 45, fill: "hsl(var(--chart-1))" },
  { type: "Espresso", count: 30, fill: "hsl(var(--chart-2))" },
  { type: "Latte", count: 15, fill: "hsl(var(--chart-3))" },
  { type: "Americano", count: 10, fill: "hsl(var(--chart-4))" },
];

const chartConfig = {
  coffee: {
    label: "Kahve",
    color: "hsl(var(--chart-1))",
  },
};

const pieChartConfig = {
  "Türk Kahvesi": {
    label: "Türk Kahvesi",
    color: "hsl(var(--chart-1))",
  },
  Espresso: {
    label: "Espresso",
    color: "hsl(var(--chart-2))",
  },
  Latte: {
    label: "Latte",
    color: "hsl(var(--chart-3))",
  },
  Americano: {
    label: "Americano",
    color: "hsl(var(--chart-4))",
  },
};

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const friends = useSelector((state) => state.kahvedostumslice.friends);
  const userDetails = useSelector((state) => state.kahvedostumslice.userDetails);
  const cafeState = useSelector((state) => state.kahvedostumslice?.cafe || {});
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const FetchRequiredData = async () => {
    dispatch(fetchFriends());
    dispatch(fetchIncomingRequests());
  };

  // Check for active cafe session
  const checkActiveSession = useCallback(() => {
    // Check Redux state first
    if (
      cafeState.cafeId &&
      cafeState.expiresAt &&
      !isSessionExpired({ expiresAt: cafeState.expiresAt })
    ) {
      setActiveSession({
        cafeId: cafeState.cafeId,
        channelKey: cafeState.channelKey,
        expiresAt: cafeState.expiresAt,
      });
      return;
    }

    // Then check localStorage
    const storedSession = loadCafeSession();
    if (storedSession && !isSessionExpired(storedSession)) {
      // Sync to Redux
      dispatch(setCafeSession(storedSession));
      setActiveSession(storedSession);
      return;
    }

    // No active session
    setActiveSession(null);
  }, [cafeState, dispatch]);

  useEffect(() => {
    FetchRequiredData();
    checkActiveSession();
  }, []);

  // Update timer for active session
  useEffect(() => {
    if (!activeSession?.expiresAt) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const remaining = getSessionTimeRemaining(activeSession);
      setTimeRemaining(remaining);

      if (remaining?.expired) {
        setActiveSession(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Handle return to cafe
  const handleReturnToCafe = useCallback(() => {
    if (activeSession) {
      navigate(`/cafe/${activeSession.channelKey}`, {
        state: activeSession,
      });
    }
  }, [activeSession, navigate]);

  // Format time for display
  const formatTime = (time) => {
    if (!time || time.expired) return "00:00";
    return `${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
  };

  const friendsCount = (friends && friends.list?.length) || 0;
  const incomingCount = (friends && friends.incomingRequests?.length) || 0;
  const userData = userDetails?.data;
  const displayName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`.trim()
    : userData?.userName || t("dashboard.welcome");

  return (
    <DefaultLayout>
      <div className="w-full min-h-screen bg-linear-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {t("dashboard.hello")}, {displayName}!
                </h1>
                <p className="text-amber-100 mt-1">
                  {t("dashboard.welcomeMessage")}
                </p>
              </div>
            </div>
          </div>

          {/* Active Cafe Session Banner */}
          {activeSession && timeRemaining && !timeRemaining.expired && (
            <Card
              className="border-2 border-emerald-300 dark:border-emerald-700 shadow-lg bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden"
              onClick={handleReturnToCafe}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 animate-pulse">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                        {t("dashboard.activeCafeSession")}
                      </h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {t("dashboard.sessionActive")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-zinc-800/80">
                      <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span
                        className={`text-xl font-bold font-mono ${
                          timeRemaining.minutes < 5
                            ? "text-red-600 dark:text-red-400 animate-pulse"
                            : "text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                    <Button
                      size="lg"
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                    >
                      {t("dashboard.returnToCafe")}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Friends Card */}
          <Card
            className="border-2 border-amber-200 dark:border-amber-900/50 shadow-lg bg-white/95 dark:bg-zinc-900/95 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
            onClick={() => navigate("/friends")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-linear-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-700 dark:text-amber-400">
                      {t("dashboard.coffeeFriends")}
                    </CardTitle>
                    <CardDescription className="dark:text-amber-500/70">
                      {t("dashboard.friendsAndMessages")}
                    </CardDescription>
                  </div>
                </div>
                {incomingCount && incomingCount > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white">
                    {incomingCount} {t("dashboard.newRequest")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-900 dark:text-amber-300">
                  {friendsCount}
                </span>
                <span className="text-amber-600 dark:text-amber-500">
                  {t("dashboard.friends")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="border-2 border-amber-200 dark:border-amber-900/50 shadow-lg bg-white/95 dark:bg-zinc-900/95 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("dashboard.totalCoffee")}
                </CardTitle>
                <Coffee className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-amber-300">
                  257
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {t("dashboard.thisMonth")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 dark:border-amber-900/50 shadow-lg bg-white/95 dark:bg-zinc-900/95 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("dashboard.favoriteCoffee")}
                </CardTitle>
                <Coffee className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-300">
                  Türk Kahvesi
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  {t("dashboard.mostPreferred")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 dark:border-amber-900/50 shadow-lg bg-white/95 dark:bg-zinc-900/95 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("dashboard.points")}
                </CardTitle>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-amber-300">
                  1,250
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  {t("dashboard.totalPoints")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Bar Chart - Monthly Coffee */}
            <Card className="border-2 border-amber-200 dark:border-amber-900/50 shadow-lg bg-white/95 dark:bg-zinc-900/95">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  {t("dashboard.monthlyCoffee")}
                </CardTitle>
                <CardDescription className="dark:text-amber-500/70">
                  {t("dashboard.last6Months")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] w-full"
                >
                  <BarChart data={monthlyData} accessibilityLayer>
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      className="[&_text]:fill-amber-700 dark:[&_text]:fill-amber-400"
                    />
                    <YAxis
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      className="[&_text]:fill-amber-700 dark:[&_text]:fill-amber-400"
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="coffee"
                      fill="hsl(var(--chart-1))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Coffee Types */}
            <Card className="border-2 border-amber-200 dark:border-amber-900/50 shadow-lg bg-white/95 dark:bg-zinc-900/95">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  {t("dashboard.coffeeTypes")}
                </CardTitle>
                <CardDescription className="dark:text-amber-500/70">
                  {t("dashboard.distribution")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={pieChartConfig}
                  className="h-[250px] w-full"
                >
                  <PieChart accessibilityLayer>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="type" />}
                    />
                    <Pie
                      data={coffeeTypes}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      strokeWidth={2}
                    >
                      {coffeeTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {coffeeTypes.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs text-amber-700 dark:text-amber-400">
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Camera FAB - only show when no active session (FloatingCafeButton takes this position) */}
      {(!activeSession || timeRemaining?.expired) && (
        <button
          onClick={() => setIsCameraOpen(true)}
          className="fixed bottom-20 right-6 z-50 group"
          aria-label={t("camera.title")}
        >
          {/* Pulse rings */}
          <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />

          {/* Button */}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-amber-500/40">
            <Camera className="h-6 w-6 transition-transform group-hover:rotate-12" />
          </span>
        </button>
      )}

      {/* Camera Modal */}
      <CameraModal open={isCameraOpen} onOpenChange={setIsCameraOpen} />
    </DefaultLayout>
  );
};

export default Dashboard;
