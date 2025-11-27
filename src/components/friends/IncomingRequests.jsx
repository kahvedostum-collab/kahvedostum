import { Inbox, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/shacdn/skeleton';
import RequestCard from './RequestCard';

const IncomingRequests = ({ requests, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-100 dark:border-green-900/50"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto sm:ml-auto">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-100 dark:border-green-900/50">
        <div className="relative mb-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <Inbox className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-zinc-700 shadow-md flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          {t('friends.empty.noIncoming')}
        </h3>
        <p className="text-green-600 dark:text-green-400 max-w-xs text-sm">
          {t('friends.empty.noIncomingDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request, index) => (
        <div
          key={request.id}
          className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <RequestCard request={request} type="incoming" />
        </div>
      ))}
    </div>
  );
};

export default IncomingRequests;
