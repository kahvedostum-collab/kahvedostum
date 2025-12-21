import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  CheckCheck,
  Clock,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { formatTime as formatTimeUtil, formatDateLong } from "@/utils/locale";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shacdn/avatar";
import { Button } from "@/components/shacdn/button";
import { Input } from "@/components/shacdn/input";
import { ScrollArea } from "@/components/shacdn/scroll-area";
import { Skeleton } from "@/components/shacdn/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shacdn/tooltip";
import {
  fetchMessages,
  sendMessage,
  markMessagesAsSeen,
} from "@/endpoints/friends/MessagesAPI";
import { toast } from "react-toastify";

const ChatView = ({ conversation, onBack, fullScreen = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMessages, isLoading } = useSelector(
    (state) => state.kahvedostumslice.messages
  );
  const currentUser = useSelector(
    (state) => state.kahvedostumslice.userDetails.data
  );
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const otherUser = conversation?.otherUser || conversation?.participant;
  // Friends API'den userId olarak geliyor, id değil
  const otherUserId =
    otherUser?.userId || otherUser?.id || conversation?.otherUserId;
  // Fixed: Use actual online status from API, default to false instead of random
  const isOnline = otherUser?.isOnline ?? false;

  useEffect(() => {
    if (conversation?.id) {
      dispatch(fetchMessages(conversation.id));
      dispatch(markMessagesAsSeen(conversation.id));
    }
  }, [conversation?.id, dispatch]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((instant = false) => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: instant ? "instant" : "smooth",
        });
      }
    }
  }, []);

  // Mesajlar yüklendiğinde veya yeni mesaj geldiğinde en alta kaydır
  const prevLoadingRef = useRef(isLoading);
  const prevMessagesLengthRef = useRef(activeMessages.length);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    const prevLength = prevMessagesLengthRef.current;

    prevLoadingRef.current = isLoading;
    prevMessagesLengthRef.current = activeMessages.length;

    // Loading bitti ve mesajlar var - ilk açılış (instant scroll)
    if (wasLoading && !isLoading && activeMessages.length > 0) {
      requestAnimationFrame(() => {
        setTimeout(() => scrollToBottom(true), 50);
      });
      return;
    }

    // Yeni mesaj eklendi (smooth scroll)
    if (!isLoading && activeMessages.length > prevLength && prevLength > 0) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [isLoading, activeMessages.length, scrollToBottom]);

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversation?.id]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Use locale utility for consistent formatting
  const formatTime = (dateString) => formatTimeUtil(dateString);

  const formatDateGroup = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString())
      return t("friends.chat.today");
    if (date.toDateString() === yesterday.toDateString())
      return t("friends.chat.yesterday");
    return formatDateLong(dateString);
  };

  // Group messages by date
  const groupedMessages = activeMessages.reduce((groups, message) => {
    const dateKey = new Date(message.createdAt).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      await dispatch(
        sendMessage({
          conversationId: conversation.id,
          content: messageText.trim(),
          receiverId: otherUserId,
        })
      ).unwrap();
      setMessageText("");
    } catch (error) {
      toast.error(error?.error?.message || t("friends.chat.sendError"));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) return null;

  const containerClass = fullScreen
    ? "flex flex-col h-[100dvh] overflow-hidden bg-white dark:bg-zinc-900"
    : "flex flex-col h-[500px] overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-sm";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="shrink-0 items-center justify-between gap-2 lg:gap-3 p-3 lg:p-4 border-b border-amber-100 dark:border-amber-900/50 bg-linear-to-r from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-800">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            aria-label={t("common.back") || "Geri"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-11 w-11 border-2 border-amber-200 dark:border-amber-700">
              <AvatarImage
                src={otherUser?.avatarUrl}
                alt={otherUser?.displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200 font-bold">
                {getInitials(otherUser?.displayName || otherUser?.userName)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          </div>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              {otherUser?.displayName || otherUser?.userName}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {isOnline ? t("friends.chat.online") : t("friends.chat.offline")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
          aria-label={t("common.moreOptions") || "Daha fazla seçenek"}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-hidden p-3 lg:p-4 bg-linear-to-b from-white to-amber-50/30 dark:from-zinc-900 dark:to-zinc-900"
      >
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
              >
                <Skeleton
                  className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-52" : "w-40"}`}
                />
              </div>
            ))}
          </div>
        ) : activeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="h-16 w-16 rounded-full bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
              {t("friends.chat.startChat")}
            </h3>
            <p className="text-amber-600 dark:text-amber-400 text-center max-w-xs">
              {t("friends.chat.noMessagesYet")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([dateKey, messages]) => (
              <div key={dateKey}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      {formatDateGroup(messages[0]?.createdAt)}
                    </span>
                  </div>
                </div>
                {/* Messages for this date */}
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    // Mesaj gönderen ID'si current user ID ile eşleşirse sağda göster
                    const isOwn =
                      currentUser?.id && message.senderId === currentUser.id;
                    const isRead = message.isRead ?? false;
                    const showAvatar =
                      !isOwn &&
                      (index === 0 ||
                        messages[index - 1]?.senderId !== message.senderId);

                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 max-h-[500px] ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Avatar for other user */}
                        {!isOwn && (
                          <div className="w-8">
                            {showAvatar && (
                              <Avatar className="h-8 w-8 border border-amber-200">
                                <AvatarImage
                                  src={otherUser?.avatarUrl}
                                  alt={`${otherUser?.displayName || otherUser?.userName} profil fotoğrafı`}
                                />
                                <AvatarFallback className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs">
                                  {getInitials(
                                    otherUser?.displayName ||
                                      otherUser?.userName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl shadow-sm ${
                            isOwn
                              ? "bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-br-md"
                              : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-amber-100 dark:border-amber-900/50"
                          }`}
                        >
                          <p className="wrap-break-word text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn
                                ? "text-amber-100"
                                : "text-amber-500 dark:text-amber-400"
                            }`}
                          >
                            <span className="text-[10px]">
                              {formatTime(message.createdAt)}
                            </span>
                            {/* Read receipt for own messages */}
                            {isOwn && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      {message.status === "sending" ? (
                                        <Clock className="h-3 w-3" />
                                      ) : isRead ? (
                                        <CheckCheck className="h-3.5 w-3.5" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5" />
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {message.status === "sending"
                                        ? t("friends.chat.sending")
                                        : isRead
                                          ? t("friends.chat.read")
                                          : t("friends.chat.sent")}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 p-3 lg:p-4 border-t border-amber-100 dark:border-amber-900/50 bg-white dark:bg-zinc-900">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder={t("friends.chat.inputPlaceholder")}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-3 lg:pr-4 py-3 lg:py-4 border-amber-200 dark:border-amber-700 rounded-xl bg-amber-50/50 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 transition-colors"
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl shrink-0 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 lg:h-5 lg:w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

ChatView.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    otherUser: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      displayName: PropTypes.string,
      userName: PropTypes.string,
      avatarUrl: PropTypes.string,
      isOnline: PropTypes.bool,
    }),
    participant: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      displayName: PropTypes.string,
      userName: PropTypes.string,
      avatarUrl: PropTypes.string,
      isOnline: PropTypes.bool,
    }),
  }),
  onBack: PropTypes.func.isRequired,
  fullScreen: PropTypes.bool,
};

ChatView.defaultProps = {
  conversation: null,
  fullScreen: false,
};

export default ChatView;
