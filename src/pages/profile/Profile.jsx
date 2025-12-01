import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shacdn/tabs';
import DefaultLayout from '@/layout/DefaultLayout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileSecurity from '@/components/profile/ProfileSecurity';

// Fake user data - will be replaced with API data later
const fakeUserProfile = {
  id: 'user-123',
  displayName: 'Ahmet Yılmaz',
  userName: 'ahmetyilmaz',
  email: 'ahmet@example.com',
  avatarUrl: null,
  bio: 'Kahve tutkunu ☕ Filtre kahve severim.',
  favoriteCoffee: 'latte',
  location: 'İstanbul, Türkiye',
  createdAt: '2024-01-15T10:30:00Z',
  stats: {
    totalCoffee: 156,
    friendsCount: 24,
    points: 1250,
  },
  settings: {
    language: 'tr',
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      friendRequests: true,
      messages: true,
    },
  },
  sessions: [
    {
      id: 1,
      device: 'Chrome - Windows',
      location: 'İstanbul',
      lastActive: '2024-01-20T15:30:00Z',
      current: true,
    },
    {
      id: 2,
      device: 'Safari - iPhone',
      location: 'İstanbul',
      lastActive: '2024-01-19T10:00:00Z',
      current: false,
    },
  ],
};

const Profile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(fakeUserProfile);
  const [activeTab, setActiveTab] = useState('info');

  const handleProfileUpdate = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleSettingsUpdate = (updates) => {
    setProfile((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  return (
    <DefaultLayout>
      <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 p-4 md:p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Header */}
          <ProfileHeader profile={profile} onUpdate={handleProfileUpdate} />

          {/* Stats Cards */}
          <ProfileStats stats={profile.stats} />

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-amber-100 dark:bg-zinc-800 rounded-xl p-1">
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 rounded-lg transition-all"
              >
                {t('profile.tabs.info')}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 rounded-lg transition-all"
              >
                {t('profile.tabs.settings')}
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 rounded-lg transition-all"
              >
                {t('profile.tabs.security')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <ProfileInfo profile={profile} onUpdate={handleProfileUpdate} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <ProfileSettings
                settings={profile.settings}
                onUpdate={handleSettingsUpdate}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <ProfileSecurity sessions={profile.sessions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
