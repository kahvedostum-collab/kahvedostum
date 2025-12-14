import { Users, UserPlus, Coffee } from "lucide-react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Skeleton } from "@/components/shacdn/skeleton";
import { Button } from "@/components/shacdn/button";
import FriendCard from "./FriendCard";

const FriendsList = ({ friends, isLoading, onMessageClick, onAddFriend }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-amber-100 dark:border-amber-900/50"
          >
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-linear-to-r from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-amber-100 dark:border-amber-900/50">
        <div className="relative mb-6">
          <div className="h-24 w-24 rounded-full bg-linear-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Users className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white dark:bg-zinc-700 shadow-md flex items-center justify-center">
            <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
          {t("friends.empty.noFriends")}
        </h3>
        <p className="text-amber-600 dark:text-amber-400 max-w-sm mb-6">
          {t("friends.empty.noFriendsDesc")}
        </p>
        {onAddFriend && (
          <Button
            onClick={onAddFriend}
            className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("friends.empty.addFirstFriend")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend, index) => (
        <div
          key={friend.id || friend.userId}
          className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <FriendCard friend={friend} onMessageClick={onMessageClick} />
        </div>
      ))}
    </div>
  );
};

FriendsList.propTypes = {
  friends: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      displayName: PropTypes.string,
      userName: PropTypes.string,
      avatarUrl: PropTypes.string,
      isOnline: PropTypes.bool,
    })
  ),
  isLoading: PropTypes.bool,
  onMessageClick: PropTypes.func,
  onAddFriend: PropTypes.func,
};

FriendsList.defaultProps = {
  friends: [],
  isLoading: false,
  onMessageClick: null,
  onAddFriend: null,
};

export default FriendsList;
