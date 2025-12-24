import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Coffee, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/shacdn/button";
import {
  loadCafeSession,
  isSessionExpired,
  getSessionTimeRemaining,
} from "@/services/cafeStorageService";

/**
 * FloatingCafeButton - Sağ alt köşede gösterilen cafe'ye dön butonu
 *
 * Bu komponent:
 * - Aktif cafe oturumu varsa ve kullanıcı CafeHub sayfasında değilse görünür
 * - Kalan süreyi countdown olarak gösterir
 * - Tıklandığında CafeHub'a yönlendirir
 * - Session süresi dolduğunda otomatik olarak kaybolur
 */
export function FloatingCafeButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux'tan cafe state'i al
  const cafeState = useSelector((state) => state.kahvedostumslice?.cafe || {});

  // Local state
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [channelKey, setChannelKey] = useState(null);

  // CafeHub sayfasında mıyız kontrolü
  const isCafeHubPage = location.pathname.includes("/cafe");

  // Session kontrolü ve timer
  const checkSession = useCallback(() => {
    // CafeHub sayfasındaysa gösterme
    if (isCafeHubPage) {
      setIsVisible(false);
      return;
    }

    // Önce Redux'tan kontrol et
    let session = null;
    if (cafeState.cafeId && cafeState.expiresAt) {
      session = {
        cafeId: cafeState.cafeId,
        expiresAt: cafeState.expiresAt,
        channelKey: cafeState.channelKey,
      };
    } else {
      // Redux'ta yoksa localStorage'dan al
      session = loadCafeSession();
    }

    // Session yoksa veya süresi dolmuşsa gösterme
    if (!session || isSessionExpired(session)) {
      setIsVisible(false);
      setTimeRemaining(null);
      return;
    }

    // Kalan süreyi hesapla
    const remaining = getSessionTimeRemaining(session);
    if (remaining?.expired) {
      setIsVisible(false);
      setTimeRemaining(null);
      return;
    }

    setTimeRemaining(remaining);
    setChannelKey(session.channelKey);
    setIsVisible(true);
  }, [cafeState, isCafeHubPage]);

  // Timer effect
  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [checkSession]);

  // Format time for display
  const formatTime = (time) => {
    if (!time || time.expired) return "00:00";
    return `${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
  };

  // Kalan süre 5 dakikadan az mı?
  const isTimeLow = timeRemaining && !timeRemaining.expired && timeRemaining.minutes < 5;

  // Handle click - navigate to CafeHub
  const handleClick = () => {
    if (channelKey) {
      navigate(`/cafe/${channelKey}`);
    }
  };

  // Görünür değilse render etme
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded view - time display */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? "max-h-24 opacity-100 mb-2" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border ${
            isTimeLow
              ? "bg-red-500/90 border-red-400/50 text-white"
              : "bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          }`}
        >
          <p className="text-xs font-medium opacity-80">
            {t("dashboard.activeCafeSession")}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className={`h-4 w-4 ${isTimeLow ? "animate-pulse" : ""}`} />
            <span className={`font-mono font-bold text-lg ${isTimeLow ? "animate-pulse" : ""}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Main floating button */}
      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`group relative h-14 px-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${
          isTimeLow
            ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        } text-white border-0`}
      >
        <div className="flex items-center gap-2">
          {/* Coffee icon with pulse effect */}
          <div className="relative">
            <Coffee className="h-5 w-5" />
            <span
              className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ${
                isTimeLow ? "bg-white" : "bg-emerald-400"
              } animate-pulse`}
            />
          </div>

          {/* Time display */}
          <span className={`font-mono font-bold ${isTimeLow ? "animate-pulse" : ""}`}>
            {formatTime(timeRemaining)}
          </span>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Button>
    </div>
  );
}

export default FloatingCafeButton;
