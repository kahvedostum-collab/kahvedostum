import PropTypes from "prop-types";
import { ArrowLeft, Users, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shacdn/button";

const FriendsPageHeader = ({
  onBack,
  onAddFriend,
  friendsCount,
  unreadMessagesCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t("friends.page.title")}
            </h1>
            <p className="text-amber-100 mt-1">
              {t("friends.page.friendCount", { count: friendsCount })} •{" "}
              {unreadMessagesCount > 0
                ? t("friends.page.unreadMessages", {
                    count: unreadMessagesCount,
                  })
                : t("friends.page.allMessagesRead")}
            </p>
          </div>
        </div>
        <Button
          onClick={onAddFriend}
          className="hidden lg:flex bg-white/20 hover:bg-white/30 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {t("friends.page.addFriend")}
        </Button>
      </div>
    </div>
  );
};

FriendsPageHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
  onAddFriend: PropTypes.func.isRequired,
  friendsCount: PropTypes.number,
  unreadMessagesCount: PropTypes.number,
};

FriendsPageHeader.defaultProps = {
  friendsCount: 0,
  unreadMessagesCount: 0,
};

export default FriendsPageHeader;
