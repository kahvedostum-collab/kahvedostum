import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import DefaultLayout from "@/layout/DefaultLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shacdn/card";
import { Badge } from "@/components/shacdn/badge";
import { Button } from "@/components/shacdn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shacdn/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shacdn/dialog";
import {
  Users,
  Clock,
  Coffee,
  User,
  Loader2,
  AlertCircle,
  LogOut,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Heart,
  UserCheck,
  Send,
  X,
  Camera,
  Wifi,
  WifiOff,
} from "lucide-react";
import { createCafeConnection } from "@/services/signalRService";
import { CameraModal } from "@/components/dashboard/CameraModal";
import { toast } from "react-toastify";

// API imports
import { fetchFriends } from "@/endpoints/friends/FriendsAPI";
import {
  sendFriendRequest,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  respondToFriendRequest,
  cancelFriendRequest,
} from "@/endpoints/friends/FriendRequestsAPI";

export default function CafeHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { channelKey: _channelKey } = useParams();

  // Redux state
  const friends = useSelector((state) => state.KDSlice?.friends || {});

  // Get state from navigation (cafeId is needed for JoinCafe)
  const { expiresAt, cafeId } = location.state || { cafeId: 1 };

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Match request dialog state
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  // SignalR connection ref
  const connectionRef = useRef(null);
  const timerRef = useRef(null);

  // Calculate time remaining
  const calculateTimeRemaining = useCallback(() => {
    if (!expiresAt) return null;

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff <= 0) {
      return { expired: true, minutes: 0, seconds: 0 };
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { expired: false, minutes, seconds };
  }, [expiresAt]);

  // Format time for display
  const formatTime = (time) => {
    if (!time || time.expired) return "00:00";
    return `${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
  };

  // Check if time is running low (less than 5 minutes)
  const isTimeLow = timeRemaining && !timeRemaining.expired && timeRemaining.minutes < 5;

  // Handle SignalR users update
  const handleUsersUpdate = useCallback((activeUsers) => {
    console.log("CafeActiveUsers received:", activeUsers);
    setUsers(activeUsers || []);
    setLoading(false);
  }, []);

  // Connect to CafeHub
  const connectToCafeHub = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token");
      }

      const connection = createCafeConnection(token);

      connection.on("CafeActiveUsers", handleUsersUpdate);

      connection.onclose((err) => {
        console.log("CafeHub connection closed:", err);
        setConnected(false);
      });

      connection.onreconnecting((err) => {
        console.log("CafeHub reconnecting:", err);
        setConnected(false);
      });

      connection.onreconnected((connectionId) => {
        console.log("CafeHub reconnected:", connectionId);
        setConnected(true);
        connection.invoke("JoinCafe", parseInt(cafeId, 10)).catch(console.error);
      });

      await connection.start();
      console.log("CafeHub connected");

      await connection.invoke("JoinCafe", parseInt(cafeId, 10));
      console.log("Joined cafe:", cafeId);

      connectionRef.current = connection;
      setConnected(true);
    } catch (err) {
      console.error("CafeHub connection error:", err);
      setError(err.message || t("cafe.users.connectionError"));
      setLoading(false);
    }
  }, [cafeId, handleUsersUpdate, t]);

  // Fetch friends data
  const fetchFriendsData = useCallback(() => {
    dispatch(fetchFriends());
    dispatch(fetchIncomingRequests());
    dispatch(fetchOutgoingRequests());
  }, [dispatch]);

  // Initialize connection and fetch data
  useEffect(() => {
    connectToCafeHub();
    fetchFriendsData();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [connectToCafeHub, fetchFriendsData]);

  // Timer for countdown
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining?.expired) {
        toast.info(t("cafe.users.sessionExpired"));
        navigate("/dashboard", { replace: true });
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [expiresAt, calculateTimeRemaining, navigate, t]);

  // Handle manual exit
  const handleExit = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.stop();
      connectionRef.current = null;
    }
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  // Handle reconnect
  const handleReconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.stop();
      connectionRef.current = null;
    }
    connectToCafeHub();
  }, [connectToCafeHub]);

  // Handle match request button click
  const handleMatchRequestClick = useCallback((user) => {
    setSelectedUser(user);
    setMatchDialogOpen(true);
  }, []);

  // Handle send match request
  const handleSendMatchRequest = useCallback(async () => {
    if (!selectedUser) return;

    setSendingRequest(true);
    try {
      await dispatch(sendFriendRequest(selectedUser.userId)).unwrap();
      toast.success(t("cafe.users.matchRequestSent"));
      setMatchDialogOpen(false);
      setSelectedUser(null);
      dispatch(fetchOutgoingRequests());
    } catch (err) {
      console.error("Match request error:", err);
      toast.error(t("cafe.users.matchRequestError"));
    } finally {
      setSendingRequest(false);
    }
  }, [selectedUser, dispatch, t]);

  // Handle respond to incoming request
  const handleRespondToRequest = useCallback(
    async (requestId, accept) => {
      try {
        await dispatch(respondToFriendRequest({ requestId, accept })).unwrap();
        toast.success(accept ? t("cafe.users.requestAccepted") : t("cafe.users.requestRejected"));
        dispatch(fetchIncomingRequests());
        if (accept) {
          dispatch(fetchFriends());
        }
      } catch (err) {
        console.error("Respond to request error:", err);
        toast.error(t("cafe.users.requestError"));
      }
    },
    [dispatch, t]
  );

  // Handle cancel outgoing request
  const handleCancelRequest = useCallback(
    async (requestId) => {
      try {
        await dispatch(cancelFriendRequest(requestId)).unwrap();
        toast.success(t("cafe.users.requestCancelled"));
        dispatch(fetchOutgoingRequests());
      } catch (err) {
        console.error("Cancel request error:", err);
        toast.error(t("cafe.users.requestError"));
      }
    },
    [dispatch, t]
  );

  // Get data from redux
  const friendsList = friends.list || [];
  const incomingRequests = friends.incomingRequests || [];
  const outgoingRequests = friends.outgoingRequests || [];

  // User Card Component
  const UserCard = ({ user, variant = "active", actions }) => {
    const variants = {
      active: {
        gradient: "from-amber-500 to-orange-500",
        bg: "bg-white dark:bg-zinc-800/80",
        border: "border-amber-200/50 dark:border-zinc-700",
        text: "text-zinc-900 dark:text-zinc-100",
      },
      match: {
        gradient: "from-pink-500 to-rose-500",
        bg: "bg-white dark:bg-zinc-800/80",
        border: "border-pink-200/50 dark:border-zinc-700",
        text: "text-zinc-900 dark:text-zinc-100",
      },
      incoming: {
        gradient: "from-emerald-500 to-green-500",
        bg: "bg-white dark:bg-zinc-800/80",
        border: "border-emerald-200/50 dark:border-zinc-700",
        text: "text-zinc-900 dark:text-zinc-100",
      },
      outgoing: {
        gradient: "from-blue-500 to-indigo-500",
        bg: "bg-white dark:bg-zinc-800/80",
        border: "border-blue-200/50 dark:border-zinc-700",
        text: "text-zinc-900 dark:text-zinc-100",
      },
    };

    const style = variants[variant];

    return (
      <div className={`group flex items-center gap-4 p-4 rounded-2xl ${style.bg} border ${style.border} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-amber-300 dark:hover:border-zinc-600`}>
        <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} shadow-lg group-hover:shadow-xl transition-shadow`}>
          <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${style.text} truncate text-base sm:text-lg`}>
            {user.displayName || user.userName || user.senderDisplayName || user.senderUserName || user.receiverDisplayName || user.receiverUserName || `${t("cafe.users.user")} #${user.userId || user.senderId || user.receiverId}`}
          </p>
          {user.badge && (
            <Badge variant="outline" className={`mt-1.5 ${user.badgeClass}`}>
              {user.badgeIcon}
              {user.badge}
            </Badge>
          )}
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>
    );
  };

  // Empty State Component
  const EmptyState = (props) => {
    const { icon: Icon, message, color = "amber" } = props;
    const colors = {
      amber: "bg-amber-100 dark:bg-amber-900/20 text-amber-500",
      pink: "bg-pink-100 dark:bg-pink-900/20 text-pink-500",
      green: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500",
      blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-500",
    };

    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${colors[color]}`}>
          <Icon className="h-10 w-10" />
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-center">{message}</p>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

            {/* Timer Card */}
            <Card className={`lg:col-span-2 overflow-hidden border-0 shadow-xl ${isTimeLow ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500'}`}>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Timer Display */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm sm:text-base font-medium">
                        {t("cafe.users.remaining")}
                      </p>
                      <p className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-mono text-white tracking-tight ${isTimeLow ? 'animate-pulse' : ''}`}>
                        {formatTime(timeRemaining)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                      onClick={() => setIsCameraOpen(true)}
                      size="lg"
                      className="gap-2 bg-white text-amber-600 hover:bg-white/90 shadow-lg font-semibold"
                    >
                      <Camera className="h-5 w-5" />
                      {t("cafe.users.extendTime")}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleExit}
                      className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      <LogOut className="h-5 w-5" />
                      {t("cafe.users.exit")}
                    </Button>
                  </div>
                </div>

                {/* Warning Message */}
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <AlertTriangle className="h-5 w-5 text-white shrink-0" />
                  <p className="text-white/90 text-sm sm:text-base">
                    {t("cafe.users.extendTimeWarning")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border-0 shadow-xl bg-white dark:bg-zinc-900">
              <CardContent className="p-6 sm:p-8 flex flex-col justify-center h-full">
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="flex items-center gap-3">
                      {connected ? (
                        <Wifi className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {connected ? t("cafe.users.connected") : t("cafe.users.disconnected")}
                      </span>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{users.length}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{t("cafe.users.tabActive")}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-center">
                      <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{friendsList.length}</p>
                      <p className="text-sm text-pink-700 dark:text-pink-300">{t("cafe.users.tabMatches")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-red-700 dark:text-red-300 flex-1">{error}</p>
                  <Button
                    variant="outline"
                    onClick={handleReconnect}
                    className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("cafe.users.retry")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto p-1.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-4 gap-1.5">
              <TabsTrigger
                value="active"
                className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline font-medium">{t("cafe.users.tabActive")}</span>
                {users.length > 0 && (
                  <Badge className="ml-1 h-5 min-w-[20px] px-1.5 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {users.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline font-medium">{t("cafe.users.tabMatches")}</span>
                {friendsList.length > 0 && (
                  <Badge className="ml-1 h-5 min-w-[20px] px-1.5 bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-200 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {friendsList.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="incoming"
                className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline font-medium">{t("cafe.users.tabIncoming")}</span>
                {incomingRequests.length > 0 && (
                  <Badge className="ml-1 h-5 min-w-[20px] px-1.5 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {incomingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="outgoing"
                className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline font-medium">{t("cafe.users.tabOutgoing")}</span>
                {outgoingRequests.length > 0 && (
                  <Badge className="ml-1 h-5 min-w-[20px] px-1.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {outgoingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Active Users Tab */}
            <TabsContent value="active" className="mt-6">
              <Card className="border-0 shadow-xl bg-white dark:bg-zinc-900">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl text-zinc-900 dark:text-zinc-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      {t("cafe.users.activeUsers")}
                    </CardTitle>
                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0">
                      {users.length} {t("cafe.users.userCount")}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                      <p className="text-zinc-500 dark:text-zinc-400">{t("cafe.users.loading")}</p>
                    </div>
                  ) : users.length === 0 ? (
                    <EmptyState icon={Users} message={t("cafe.users.empty")} color="amber" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {users.map((user, index) => (
                        <UserCard
                          key={user.userId || index}
                          user={{
                            ...user,
                            badge: t("cafe.users.active"),
                            badgeIcon: <CheckCircle2 className="h-3 w-3 mr-1" />,
                            badgeClass: "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                          }}
                          variant="active"
                          actions={
                            <Button
                              size="sm"
                              onClick={() => handleMatchRequestClick(user)}
                              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                            >
                              <UserPlus className="h-4 w-4" />
                              <span className="hidden sm:inline">{t("cafe.users.matchRequest")}</span>
                            </Button>
                          }
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Matches Tab */}
            <TabsContent value="matches" className="mt-6">
              <Card className="border-0 shadow-xl bg-white dark:bg-zinc-900">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl text-zinc-900 dark:text-zinc-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      {t("cafe.users.myMatches")}
                    </CardTitle>
                    <Badge className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-0">
                      {friendsList.length} {t("cafe.users.matchCount")}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {friends.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
                    </div>
                  ) : friendsList.length === 0 ? (
                    <EmptyState icon={Heart} message={t("cafe.users.noMatches")} color="pink" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {friendsList.map((friend, index) => (
                        <UserCard
                          key={friend.id || friend.userId || index}
                          user={{
                            ...friend,
                            badge: t("cafe.users.matched"),
                            badgeIcon: <UserCheck className="h-3 w-3 mr-1" />,
                            badgeClass: "border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
                          }}
                          variant="match"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Incoming Requests Tab */}
            <TabsContent value="incoming" className="mt-6">
              <Card className="border-0 shadow-xl bg-white dark:bg-zinc-900">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl text-zinc-900 dark:text-zinc-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                        <UserPlus className="h-5 w-5 text-white" />
                      </div>
                      {t("cafe.users.incomingRequests")}
                    </CardTitle>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                      {incomingRequests.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {friends.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                    </div>
                  ) : incomingRequests.length === 0 ? (
                    <EmptyState icon={UserPlus} message={t("cafe.users.noIncoming")} color="green" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {incomingRequests.map((request, index) => (
                        <UserCard
                          key={request.id || index}
                          user={request}
                          variant="incoming"
                          actions={
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRespondToRequest(request.id, true)}
                                className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="hidden sm:inline">{t("cafe.users.accept")}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRespondToRequest(request.id, false)}
                                className="gap-1 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Outgoing Requests Tab */}
            <TabsContent value="outgoing" className="mt-6">
              <Card className="border-0 shadow-xl bg-white dark:bg-zinc-900">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl text-zinc-900 dark:text-zinc-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      {t("cafe.users.outgoingRequests")}
                    </CardTitle>
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                      {outgoingRequests.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {friends.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                  ) : outgoingRequests.length === 0 ? (
                    <EmptyState icon={Send} message={t("cafe.users.noOutgoing")} color="blue" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {outgoingRequests.map((request, index) => (
                        <UserCard
                          key={request.id || index}
                          user={{
                            ...request,
                            badge: t("cafe.users.pending"),
                            badgeClass: "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                          }}
                          variant="outgoing"
                          actions={
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelRequest(request.id)}
                              className="gap-1 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                              <span className="hidden sm:inline">{t("cafe.users.cancel")}</span>
                            </Button>
                          }
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Info Card */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <Coffee className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                  {t("cafe.users.infoText")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Match Request Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              {t("cafe.users.matchRequestTitle")}
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400 text-base">
              {t("cafe.users.matchRequestDescription", { userId: selectedUser?.userId })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setMatchDialogOpen(false)}
              disabled={sendingRequest}
              className="flex-1 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSendMatchRequest}
              disabled={sendingRequest}
              className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {sendingRequest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("cafe.users.sending")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {t("cafe.users.sendRequest")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      <CameraModal open={isCameraOpen} onOpenChange={setIsCameraOpen} />
    </DefaultLayout>
  );
}
