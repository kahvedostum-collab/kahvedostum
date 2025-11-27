import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, Globe, Sun, Moon, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/shacdn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shacdn/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/shacdn/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

// Available languages with flags
const languages = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

const EmptyLayout = () => {
  const { t, i18n } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageOpen(false);
  };

  const currentLanguage = i18n.language?.split("-")[0] || "tr";
  const currentLangData =
    languages.find((l) => l.code === currentLanguage) || languages[0];

  return (
    <div className="relative min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-900 dark:via-amber-950 dark:to-zinc-900 p-4 transition-colors duration-300">
      {/* Kahve Desenli Arka Plan */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Settings Dropdown - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300"
            >
              <Settings className="h-5 w-5 text-amber-700 dark:text-amber-300" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800 p-0 overflow-hidden"
          >
            {/* Header */}
            <div className="px-3 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-800 border-b border-amber-100 dark:border-amber-900/50">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {t("settings.title")}
              </p>
            </div>

            {/* Language Section - Collapsible */}
            <div className="p-2">
              <Collapsible
                open={isLanguageOpen}
                onOpenChange={setIsLanguageOpen}
              >
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors group">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          {t("language.title")}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {currentLangData.flag} {currentLangData.name}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-amber-500 transition-transform duration-200 ${
                        isLanguageOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1">
                  <ScrollArea className="h-fit">
                    <div className="space-y-0.5 pr-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                            currentLanguage === lang.code
                              ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-900 dark:text-amber-100"
                              : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm font-medium">
                              {lang.name}
                            </span>
                          </div>
                          {currentLanguage === lang.code && (
                            <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <DropdownMenuSeparator className="bg-amber-100 dark:bg-amber-900/50 m-0" />

            {/* Theme Toggle */}
            <div className="p-2">
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer rounded-lg px-2 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center">
                    {isDark ? (
                      <Sun className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                    ) : (
                      <Moon className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {t("theme.title")}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {isDark ? t("theme.dark") : t("theme.light")}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default EmptyLayout;
