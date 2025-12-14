import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  MoreVertical,
  MessageCircle,
  UserMinus,
  Coffee,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shacdn/avatar";
import { Button } from "@/components/shacdn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shacdn/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shacdn/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shacdn/tooltip";
import { removeFriend } from "@/endpoints/friends/FriendsAPI";
import { toast } from "react-toastify";

const FriendCard = ({ friend, onMessageClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fixed: Use actual online status from API, default to false instead of random
  const isOnline = friend.isOnline ?? false;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await dispatch(removeFriend(friend.userId || friend.id)).unwrap();
      toast.success(t("friends.card.removedSuccess"));
      setShowConfirm(false);
    } catch (error) {
      toast.error(error?.error?.message || t("common.error"));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div className="group flex items-center justify-between p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl border border-white/30 dark:border-amber-900/30 shadow-sm hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:border-amber-200/50 dark:hover:border-amber-700/50 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-default">
        <div className="flex items-center gap-4">
          {/* Avatar with Online Status */}
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-amber-200 dark:border-amber-700 ring-2 ring-amber-50 dark:ring-amber-900/30 transition-all duration-300 group-hover:ring-amber-100 dark:group-hover:ring-amber-800/50">
              <AvatarImage
                src={friend.avatarUrl}
                alt={friend.displayName || friend.userName}
                className="object-cover"
              />
              <AvatarFallback className="bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200 font-bold text-lg">
                {getInitials(friend.displayName || friend.userName)}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Dot */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                      isOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isOnline
                      ? t("friends.chat.online")
                      : t("friends.chat.offline")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <p className="font-semibold text-amber-900 dark:text-amber-100 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              {friend.displayName || friend.userName}
            </p>
            {friend.userName && (
              <p className="text-sm text-amber-500 dark:text-amber-500">
                @{friend.userName}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <Coffee className="h-3 w-3 text-amber-400" />
              <span className="text-xs text-amber-400">
                {t("friends.card.badge")}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-linear-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 hover:border-amber-300 dark:hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-200 transition-all duration-300 group/btn"
            onClick={() => onMessageClick?.(friend)}
          >
            <MessageCircle className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            <span className="hidden sm:inline">
              {t("friends.card.message")}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                aria-label={t("common.moreOptions") || "Daha fazla seçenek"}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-lg border-amber-200/50 dark:border-amber-900/50 shadow-lg"
            >
              <DropdownMenuItem
                onClick={() => onMessageClick?.(friend)}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/30"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t("friends.card.sendMessage")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => setShowConfirm(true)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                {t("friends.card.removeFriend")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md max-w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-red-200 dark:border-red-900/50"
        >
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10v10H0z%22%20fill%3D%22%23fff%22%20fill-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
            <DialogHeader className="relative">
              <DialogTitle className="text-white flex items-center gap-3 text-lg font-semibold">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                {t("friends.card.removeFriend")}
              </DialogTitle>
              <DialogDescription className="text-red-100 mt-1">
                {t("friends.card.removeFriendDesc", {
                  name: friend.displayName || friend.userName,
                })}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Friend Info Preview */}
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 mb-6">
              <Avatar className="h-12 w-12 border-2 border-red-200 dark:border-red-800">
                <AvatarImage
                  src={friend.avatarUrl}
                  alt={friend.displayName || friend.userName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-800 dark:text-red-200 font-bold">
                  {getInitials(friend.displayName || friend.userName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">
                  {friend.displayName || friend.userName}
                </p>
                {friend.userName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    @{friend.userName}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-11 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {t("friends.card.cancel")}
              </Button>
              <Button
                onClick={handleRemove}
                disabled={isRemoving}
                className="flex-1 h-11 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/30"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("friends.card.removing")}
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    {t("friends.card.remove")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

FriendCard.propTypes = {
  friend: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    displayName: PropTypes.string,
    userName: PropTypes.string,
    avatarUrl: PropTypes.string,
    isOnline: PropTypes.bool,
  }).isRequired,
  onMessageClick: PropTypes.func,
};

FriendCard.defaultProps = {
  onMessageClick: null,
};

export default FriendCard;
