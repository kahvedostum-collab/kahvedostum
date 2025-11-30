import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Coffee, Users, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/shacdn/card';

const ProfileStats = ({ stats }) => {
  const { t } = useTranslation();

  const statItems = [
    {
      key: 'totalCoffee',
      value: stats.totalCoffee,
      label: t('profile.stats.totalCoffee'),
      icon: Coffee,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      key: 'friends',
      value: stats.friendsCount,
      label: t('profile.stats.friends'),
      icon: Users,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      key: 'points',
      value: stats.points.toLocaleString(),
      label: t('profile.stats.points'),
      icon: Trophy,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      {statItems.map((item) => (
        <Card
          key={item.key}
          className="border-2 border-amber-200 dark:border-amber-900/50 bg-white/95 dark:bg-zinc-900/95 hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-4 text-center">
            <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${item.bgColor} mb-3`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-amber-900 dark:text-amber-300">
              {item.value}
            </div>
            <div className="text-xs md:text-sm text-amber-600 dark:text-amber-500 mt-1">
              {item.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

ProfileStats.propTypes = {
  stats: PropTypes.shape({
    totalCoffee: PropTypes.number.isRequired,
    friendsCount: PropTypes.number.isRequired,
    points: PropTypes.number.isRequired,
  }).isRequired,
};

export default ProfileStats;
