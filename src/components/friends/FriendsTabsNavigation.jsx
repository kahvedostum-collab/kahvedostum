import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { Users, Inbox, MessageSquare } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shacdn/tabs";
import { Badge } from "@/components/shacdn/badge";

const FriendsTabsNavigation = ({
  activeTab,
  onTabChange,
  friendsCount,
  incomingCount,
  unreadMessagesCount,
  children,
}) => {
  const { t } = useTranslation();
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const frameIds = [];

    const trackFrame = (callback) => {
      const id = requestAnimationFrame(callback);
      frameIds.push(id);
      return id;
    };

    const updateIndicator = () => {
      if (!tabsRef.current || !indicatorRef.current) return;
      const activeTabEl = tabsRef.current.querySelector(
        '[data-state="active"]'
      );
      if (activeTabEl) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTabEl.getBoundingClientRect();

        gsap.to(indicatorRef.current, {
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          duration: 0.4,
          ease: "power3.out",
        });
      }
    };

    const initIndicator = () => {
      if (!tabsRef.current || !indicatorRef.current) return;
      const activeTabEl = tabsRef.current.querySelector(
        '[data-state="active"]'
      );
      if (activeTabEl) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTabEl.getBoundingClientRect();

        gsap.set(indicatorRef.current, {
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
        });
      }
    };

    trackFrame(() => {
      initIndicator();
      if (activeTab) {
        trackFrame(updateIndicator);
      }
    });

    const handleResize = () => trackFrame(initIndicator);
    window.addEventListener("resize", handleResize);

    return () => {
      frameIds.forEach(cancelAnimationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList
        ref={tabsRef}
        className="relative grid w-full grid-cols-3 bg-white dark:bg-zinc-900 p-1 rounded-xl h-auto border-2 border-amber-200 dark:border-amber-900/50 shadow-sm"
      >
        {/* Animated Indicator - GSAP controlled */}
        <div
          ref={indicatorRef}
          className="absolute bottom-1 h-0.5 bg-linear-to-r from-amber-500 to-orange-500 rounded-full"
        />
        <TabsTrigger
          value="friends"
          className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 text-amber-600 dark:text-amber-500 font-medium hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-800 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:font-semibold"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">{t("friends.tabs.friends")}</span>
          <Badge
            variant="secondary"
            className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold"
          >
            {friendsCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="requests"
          className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 text-amber-600 dark:text-amber-500 font-medium hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-800 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:font-semibold"
        >
          <Inbox className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t("friends.tabs.requests")}
          </span>
          {incomingCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs animate-pulse">
              {incomingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="messages"
          className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 text-amber-600 dark:text-amber-500 font-medium hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-800 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:font-semibold"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t("friends.tabs.messages")}
          </span>
          {unreadMessagesCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs animate-pulse">
              {unreadMessagesCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};

FriendsTabsNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  friendsCount: PropTypes.number,
  incomingCount: PropTypes.number,
  unreadMessagesCount: PropTypes.number,
  children: PropTypes.node,
};

FriendsTabsNavigation.defaultProps = {
  friendsCount: 0,
  incomingCount: 0,
  unreadMessagesCount: 0,
  children: null,
};

export default FriendsTabsNavigation;
