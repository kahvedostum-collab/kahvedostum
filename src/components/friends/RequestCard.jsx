import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Check, X, Clock, UserPlus, Loader2, Send } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shacdn/avatar";
import { Button } from "@/components/shacdn/button";
import {
  respondToFriendRequest,
  cancelFriendRequest,
} from "@/endpoints/friends/FriendRequestsAPI";
import { toast } from "react-toastify";

const RequestCard = ({ request, type = "incoming" }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState(null);

  // API response yapısı: { requestId, fromUserId, fromUserName, fromUserEmail, ... }
  // veya { requestId, toUserId, toUserName, toUserEmail, ... }
  const user = type === "incoming"
    ? { id: request.fromUserId, userName: request.fromUserName, email: request.fromUserEmail }
    : { id: request.toUserId, userName: request.toUserName, email: request.toUserEmail };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t("friends.time.now");
    if (minutes < 60) return t("friends.time.minutesAgo", { count: minutes });
    if (hours < 24) return t("friends.time.hoursAgo", { count: hours });
    if (days < 7) return t("friends.time.daysAgo", { count: days });
    return date.toLocaleDateString("tr-TR");
  };

  const handleAccept = async () => {
    setIsLoading(true);
    setActionType("accept");
    try {
      await dispatch(
        respondToFriendRequest({ requestId: request.requestId, accept: true })
      ).unwrap();
      toast.success(t("friends.requests.acceptedSuccess"));
    } catch (error) {
      toast.error(error?.error?.message || "Bir hata oluştu");
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    setActionType("reject");
    try {
      await dispatch(
        respondToFriendRequest({ requestId: request.requestId, accept: false })
      ).unwrap();
      toast.info(t("friends.requests.rejectedInfo"));
    } catch (error) {
      toast.error(error?.error?.message || "Bir hata oluştu");
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    setActionType("cancel");
    try {
      await dispatch(cancelFriendRequest(request.requestId)).unwrap();
      toast.info(t("friends.requests.cancelledInfo"));
    } catch (error) {
      toast.error(error?.error?.message || "Bir hata oluştu");
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const isIncoming = type === "incoming";

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
        isIncoming
          ? "bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900/50 hover:border-green-200 dark:hover:border-green-700"
          : "bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700"
      }`}
    >
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        {/* Avatar */}
        <div className="relative">
          <Avatar
            className={`h-14 w-14 border-2 ring-2 transition-all duration-300 ${
              isIncoming
                ? "border-green-200 dark:border-green-700 ring-green-50 dark:ring-green-900/30 group-hover:ring-green-100 dark:group-hover:ring-green-800/50"
                : "border-amber-200 dark:border-amber-700 ring-amber-50 dark:ring-amber-900/30 group-hover:ring-amber-100 dark:group-hover:ring-amber-800/50"
            }`}
          >
            <AvatarImage
              src={user?.avatarUrl}
              alt={user?.displayName || user?.userName}
              className="object-cover"
            />
            <AvatarFallback
              className={`font-bold text-lg ${
                isIncoming
                  ? "bg-linear-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-800 dark:text-green-200"
                  : "bg-linear-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200"
              }`}
            >
              {getInitials(user?.displayName || user?.userName)}
            </AvatarFallback>
          </Avatar>
          {/* Request type indicator */}
          <span
            className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center ${
              isIncoming ? "bg-green-500" : "bg-amber-500"
            }`}
          >
            {isIncoming ? (
              <UserPlus className="h-3 w-3 text-white" />
            ) : (
              <Send className="h-3 w-3 text-white" />
            )}
          </span>
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <p
            className={`font-semibold text-lg ${
              isIncoming
                ? "text-green-900 dark:text-green-100"
                : "text-amber-900 dark:text-amber-100"
            }`}
          >
            {user?.displayName ||
              user?.userName ||
              t("friends.card.unknownUser")}
          </p>
          {user?.userName && (
            <p
              className={`text-sm ${isIncoming ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
            >
              @{user.userName}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <Clock
              className={`h-3.5 w-3.5 ${isIncoming ? "text-green-400" : "text-amber-400"}`}
            />
            <span
              className={`text-xs ${isIncoming ? "text-green-500 dark:text-green-400" : "text-amber-500 dark:text-amber-400"}`}
            >
              {formatDate(request.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {isIncoming ? (
          <>
            <Button
              size="sm"
              className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleAccept}
              disabled={isLoading}
            >
              {isLoading && actionType === "accept" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">
                    {t("friends.requests.accept")}
                  </span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading && actionType === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">
                    {t("friends.requests.reject")}
                  </span>
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-300"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading && actionType === "cancel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-1.5" />
                {t("friends.requests.cancelRequest")}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
