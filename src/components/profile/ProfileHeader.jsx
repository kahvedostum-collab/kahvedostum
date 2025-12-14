import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shacdn/avatar";
import { Badge } from "@/components/shacdn/badge";
import { formatDateLong } from "@/utils/locale";

const ProfileHeader = ({ profile }) => {
  const { t } = useTranslation();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const memberSince = formatDateLong(profile.createdAt);

  return (
    <div className="relative bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-2xl p-6 shadow-lg overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar - Read Only */}
        <div className="relative">
          <Avatar className="h-28 w-28 border-4 border-white/30 shadow-xl">
            <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
              {profile.avatarUrl ? null : <User className="h-12 w-12" />}
              {!profile.avatarUrl && getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info - Read Only */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {profile.displayName}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
            <Badge className="bg-white/20 text-white border-none">
              @{profile.userName}
            </Badge>
            <span className="text-amber-100">•</span>
            <span className="text-amber-100 text-sm">
              {t("profile.memberSince")}: {memberSince}
            </span>
          </div>
          {profile.bio && (
            <p className="mt-3 text-amber-100 max-w-md">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    bio: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
};

export default ProfileHeader;
