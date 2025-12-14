import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shacdn/tabs";
import DefaultLayout from "@/layout/DefaultLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileSettings from "@/components/profile/ProfileSettings";
import ProfileSecurity from "@/components/profile/ProfileSecurity";

const Profile = () => {
  const { t } = useTranslation();
  const { data: userData } = useSelector(
    (state) => state.kahvedostumslice?.userDetails || {}
  );
  const [activeTab, setActiveTab] = useState("info");

  // API verisini profile formatına dönüştür
  const getDisplayName = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`.trim();
    }
    return userData?.userName || "Ad Soyad";
  };

  const [profile, setProfile] = useState({
    id: userData?.id || "",
    displayName: getDisplayName(),
    userName: userData?.userName || "username",
    email: userData?.email || "",
    avatarUrl: userData?.avatarUrl || null,
    bio: "",
    favoriteCoffee: "",
    location: "",
    createdAt: "",
    stats: {
      totalCoffee: 0,
      friendsCount: 0,
      points: 0,
    },
    settings: {
      language: "tr",
      theme: "system",
      notifications: {
        email: true,
        push: true,
        friendRequests: true,
        messages: true,
      },
    },
    sessions: [],
  });

  // userData değiştiğinde profile'ı güncelle
  useEffect(() => {
    if (userData) {
      setProfile((prev) => ({
        ...prev,
        id: userData.id || prev.id,
        displayName: getDisplayName(),
        userName: userData.userName || prev.userName,
        email: userData.email || prev.email,
        avatarUrl: userData.avatarUrl || prev.avatarUrl,
      }));
    }
  }, [userData]);

  const handleProfileUpdate = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleSettingsUpdate = (updates) => {
    setProfile((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  return (
    <DefaultLayout>
      <div className="w-full min-h-screen bg-linear-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 p-4 md:p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Header - Read Only */}
          <ProfileHeader profile={profile} />

          {/* Stats Cards */}
          <ProfileStats stats={profile.stats} />

          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 bg-amber-100/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl p-1 border border-amber-200/50 dark:border-amber-900/30 overflow-hidden">
              <TabsTrigger
                value="info"
                className="min-w-0 rounded-lg py-2 px-2 text-xs sm:text-sm font-medium transition-all duration-200 truncate
                  text-amber-700/70 dark:text-amber-400/60
                  hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-zinc-700/50
                  data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700
                  data-[state=active]:text-amber-800 dark:data-[state=active]:text-amber-300
                  data-[state=active]:shadow-sm data-[state=active]:shadow-amber-200/50 dark:data-[state=active]:shadow-black/20"
              >
                {t("profile.tabs.info")}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="min-w-0 rounded-lg py-2 px-2 text-xs sm:text-sm font-medium transition-all duration-200 truncate
                  text-amber-700/70 dark:text-amber-400/60
                  hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-zinc-700/50
                  data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700
                  data-[state=active]:text-amber-800 dark:data-[state=active]:text-amber-300
                  data-[state=active]:shadow-sm data-[state=active]:shadow-amber-200/50 dark:data-[state=active]:shadow-black/20"
              >
                {t("profile.tabs.settings")}
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="min-w-0 rounded-lg py-2 px-2 text-xs sm:text-sm font-medium transition-all duration-200 truncate
                  text-amber-700/70 dark:text-amber-400/60
                  hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-zinc-700/50
                  data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700
                  data-[state=active]:text-amber-800 dark:data-[state=active]:text-amber-300
                  data-[state=active]:shadow-sm data-[state=active]:shadow-amber-200/50 dark:data-[state=active]:shadow-black/20"
              >
                {t("profile.tabs.security")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <ProfileInfo profile={profile} onUpdate={handleProfileUpdate} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <ProfileSettings
                settings={profile.settings}
                onUpdate={handleSettingsUpdate}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <ProfileSecurity sessions={profile.sessions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
