import { MessageCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/shacdn/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shacdn/avatar';
import { Badge } from '@/components/shacdn/badge';
import { ScrollArea } from '@/components/shacdn/scroll-area';

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

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t('friends.time.now');
    if (minutes < 60) return t('friends.time.minutesShort', { count: minutes });
    if (hours < 24) return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (days < 7) return t('friends.time.daysShort', { count: days });
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-linear-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-amber-100 dark:border-amber-900/50">
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
      <div className="space-y-2 pr-2">
        {conversations.map((conversation) => {
          const otherUser = conversation.otherUser || conversation.participant;
          const isActive = activeId === conversation.id;
          const isOnline = otherUser?.isOnline ?? Math.random() > 0.5;
          const hasUnread = (conversation.unreadCount || 0) > 0;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left group ${
                isActive
                  ? 'bg-linear-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-amber-300 dark:border-amber-600 shadow-md'
                  : 'bg-white dark:bg-zinc-800 border border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-md hover:scale-[1.01]'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className={`h-14 w-14 border-2 transition-all duration-300 ${
                  isActive ? 'border-amber-400 dark:border-amber-500' : 'border-amber-200 dark:border-amber-700 group-hover:border-amber-300 dark:group-hover:border-amber-600'
                }`}>
                  <AvatarImage
                    src={otherUser?.avatarUrl}
                    alt={otherUser?.displayName || otherUser?.userName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200 font-bold">
                    {getInitials(otherUser?.displayName || otherUser?.userName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online status */}
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                    isOnline ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                {/* Unread badge */}
                {hasUnread && (
                  <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center bg-red-500 text-white text-xs font-bold shadow-md">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </Badge>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-semibold truncate ${
                    isActive ? 'text-amber-900 dark:text-amber-100' : 'text-amber-800 dark:text-amber-200 group-hover:text-amber-900 dark:group-hover:text-amber-100'
                  } ${hasUnread ? 'font-bold' : ''}`}>
                    {otherUser?.displayName || otherUser?.userName || t('friends.card.unknownUser')}
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 shrink-0 ml-2">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm truncate ${
                  hasUnread ? 'text-amber-900 dark:text-amber-100 font-medium' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {conversation.lastMessage?.content || t('friends.chat.noMessage')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationsList;
