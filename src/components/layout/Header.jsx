import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  LogOut,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shacdn/avatar";
import { Button } from "@/components/shacdn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/shacdn/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// Fake user data - will be replaced with real data later
const fakeUser = {
  displayName: "Kahve Sever",
  userName: "kahvesever",
  email: "kahve@example.com",
  avatarUrl: null,
};

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const user = fakeUser;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language?.split("-")[0] || "tr";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200/50 bg-white/80 backdrop-blur-md dark:bg-zinc-900/80 dark:border-amber-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / App Name */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hidden sm:block">
              {t("header.appName")}
            </span>
          </button>

          {/* Right side - Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-xl transition-all duration-300"
              >
                <Avatar className="h-9 w-9 border-2 border-amber-200 dark:border-amber-700">
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 text-amber-800 dark:text-amber-200 font-bold text-sm">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    @{user.userName}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800"
            >
              {/* User info - visible on mobile */}
              <DropdownMenuLabel className="md:hidden">
                <div className="flex flex-col">
                  <span className="font-semibold text-amber-900 dark:text-amber-100">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-normal">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden bg-amber-200 dark:bg-amber-800" />

              {/* Profile */}
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                <User className="h-4 w-4 mr-2" />
                {t("header.profile")}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-amber-200 dark:bg-amber-800" />

              {/* Language Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50">
                  <Globe className="h-4 w-4 mr-2" />
                  {t("language.title")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800">
                  <DropdownMenuRadioGroup
                    value={currentLanguage}
                    onValueChange={changeLanguage}
                  >
                    <DropdownMenuRadioItem
                      value="tr"
                      className="cursor-pointer text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                      <span className="mr-2">🇹🇷</span>
                      {t("language.tr")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="en"
                      className="cursor-pointer text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                      <span className="mr-2">🇬🇧</span>
                      {t("language.en")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Theme Toggle */}
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    {t("theme.light")}
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    {t("theme.dark")}
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-amber-200 dark:bg-amber-800" />

              {/* Logout */}
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("header.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
