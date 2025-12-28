import { MessageCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Skeleton } from '@/components/shacdn/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shacdn/avatar';
import { Badge } from '@/components/shacdn/badge';
import { ScrollArea } from '@/components/shacdn/scroll-area';
import { formatRelativeTime } from '@/utils/locale';

const ConversationsList = ({ conversations, isLoading, onSelect, activeId }) => {
  const { t } = useTranslation();

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Use locale utility for consistent formatting
  const formatTime = (dateString) => formatRelativeTime(dateString, t);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-amber-100 dark:border-amber-900/50"
          >
            <Skeleton className="h-14 w-14 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-4 w-12 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-16 text-center bg-linear-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-amber-100 dark:border-amber-900/50">
        <div className="h-20 w-20 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <MessageCircle className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
          {t('friends.empty.noMessages')}
        </h3>
        <p className="text-amber-600 dark:text-amber-400 max-w-xs">
          {t('friends.empty.noMessagesDesc')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[450px]">
      <div className="space-y-3">
        {conversations.map((conversation, index) => {
          const otherUser = conversation.otherUser || conversation.participant;
          const isActive = activeId === conversation.id;
          // Fixed: Use actual online status from API, default to false instead of random
          const isOnline = otherUser?.isOnline ?? false;
          const hasUnread = (conversation.unreadCount || 0) > 0;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left group animate-in fade-in-50 slide-in-from-bottom-2 fill-mode-both ${
                isActive
                  ? 'bg-linear-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-amber-300 dark:border-amber-600 shadow-md'
                  : 'bg-white dark:bg-zinc-800 border border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-md hover:scale-[1.01]'
              }`}
            >
              {/* Avatar Bölümü */}
              <div className="relative shrink-0">
                <Avatar className={`h-14 w-14 border-2 transition-all duration-300 ${
                  isActive ? 'border-amber-400 dark:border-amber-500' : 'border-amber-200 dark:border-amber-700 group-hover:border-amber-300 dark:group-hover:border-amber-600'
                }`}>
                  <AvatarImage
                    src={otherUser?.avatarUrl}
                    alt={`${otherUser?.displayName || otherUser?.userName || t('friends.card.unknownUser')} profil fotoğrafı`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200 font-bold text-base">
                    {getInitials(otherUser?.displayName || otherUser?.userName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online status */}
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-800 ${
                    isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                {/* Unread badge */}
                {hasUnread && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold shadow-md animate-in zoom-in-50">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </Badge>
                )}
              </div>

              {/* İçerik Bölümü */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate leading-tight ${
                  isActive ? 'text-amber-900 dark:text-amber-100' : 'text-amber-800 dark:text-amber-200 group-hover:text-amber-900 dark:group-hover:text-amber-100'
                } ${hasUnread ? 'font-bold' : ''}`}>
                  {otherUser?.displayName || otherUser?.userName || t('friends.card.unknownUser')}
                </p>
                <p className={`text-sm truncate mt-1 leading-tight ${
                  hasUnread ? 'text-amber-900 dark:text-amber-100 font-medium' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {conversation.lastMessage?.content || t('friends.chat.noMessage')}
                </p>
              </div>

              {/* Zaman Bölümü */}
              <div className="shrink-0 flex flex-col items-end justify-center gap-1">
                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs whitespace-nowrap">
                    {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

ConversationsList.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
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
      lastMessage: PropTypes.shape({
        content: PropTypes.string,
      }),
      lastMessageAt: PropTypes.string,
      updatedAt: PropTypes.string,
      unreadCount: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  activeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ConversationsList.defaultProps = {
  conversations: [],
  isLoading: false,
  activeId: null,
};

export default ConversationsList;
