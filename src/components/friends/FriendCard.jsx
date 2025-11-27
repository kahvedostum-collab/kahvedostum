import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  MoreVertical,
  MessageCircle,
  UserMinus,
  Coffee,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shacdn/avatar';
import { Button } from '@/components/shacdn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shacdn/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shacdn/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shacdn/tooltip';
import { removeFriend } from '@/endpoints/friends/FriendsAPI';
import { toast } from 'react-toastify';

const FriendCard = ({ friend, onMessageClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Simüle edilmiş online durumu (rastgele)
  const isOnline = friend.isOnline ?? Math.random() > 0.5;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await dispatch(removeFriend(friend.userId || friend.id)).unwrap();
      toast.success(t('friends.card.removedSuccess'));
      setShowConfirm(false);
    } catch (error) {
      toast.error(error?.error?.message || 'Bir hata oluştu');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-xl border border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-default">
        <div className="flex items-center gap-4">
          {/* Avatar with Online Status */}
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-amber-200 dark:border-amber-700 ring-2 ring-amber-50 dark:ring-amber-900/30 transition-all duration-300 group-hover:ring-amber-100 dark:group-hover:ring-amber-800/50">
              <AvatarImage
                src={friend.avatarUrl}
                alt={friend.displayName || friend.userName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200 font-bold text-lg">
                {getInitials(friend.displayName || friend.userName)}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Dot */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                      isOnline
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-gray-300'
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isOnline ? t('friends.chat.online') : t('friends.chat.offline')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <p className="font-semibold text-amber-900 dark:text-amber-100 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              {friend.displayName || friend.userName}
            </p>
            {friend.userName && (
              <p className="text-sm text-amber-500 dark:text-amber-500">@{friend.userName}</p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <Coffee className="h-3 w-3 text-amber-400" />
              <span className="text-xs text-amber-400">{t('friends.card.badge')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 hover:border-amber-300 dark:hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-200 transition-all duration-300 group/btn"
            onClick={() => onMessageClick?.(friend)}
          >
            <MessageCircle className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t('friends.card.message')}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-800 dark:border-amber-900/50">
              <DropdownMenuItem
                onClick={() => onMessageClick?.(friend)}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/30"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('friends.card.sendMessage')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => setShowConfirm(true)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                {t('friends.card.removeFriend')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-700">
          <DialogHeader className="text-center sm:text-left">
            <div className="mx-auto sm:mx-0 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl dark:text-white">{t('friends.card.removeFriend')}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t('friends.card.removeFriendDesc', { name: friend.displayName || friend.userName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="w-full sm:w-auto"
            >
              {t('friends.card.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
              className="w-full sm:w-auto"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('friends.card.removing')}
                </>
              ) : (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  {t('friends.card.remove')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FriendCard;
