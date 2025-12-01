import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Globe, Palette, Bell } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shacdn/card';
import { Label } from '@/components/shacdn/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/shacdn/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const themeOptions = [
  { value: 'light', labelKey: 'theme.light' },
  { value: 'dark', labelKey: 'theme.dark' },
  { value: 'system', labelKey: 'theme.system' },
];

const languageOptions = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' },
];

const ProfileSettings = ({ settings, onUpdate }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value) => {
    i18n.changeLanguage(value);
    onUpdate({ language: value });
  };

  const handleThemeChange = (value) => {
    // Theme change logic - integrate with your theme provider
    onUpdate({ theme: value });

    // Apply theme immediately
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  const handleNotificationChange = (key, value) => {
    onUpdate({
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-900/50 bg-white/95 dark:bg-zinc-900/95">
      <CardHeader>
        <CardTitle className="text-amber-700 dark:text-amber-400">
          {t('profile.tabs.settings')}
        </CardTitle>
        <CardDescription className="dark:text-amber-500/70">
          {t('profile.settings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <Label className="text-amber-700 dark:text-amber-400 font-medium">
                {t('profile.settings.language')}
              </Label>
              <p className="text-sm text-amber-500 dark:text-amber-600">
                {t('profile.settings.languageDesc')}
              </p>
            </div>
            <Select value={settings.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-amber-200 dark:bg-amber-800" />

        {/* Theme Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Palette className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <Label className="text-amber-700 dark:text-amber-400 font-medium">
                {t('profile.settings.theme')}
              </Label>
              <p className="text-sm text-amber-500 dark:text-amber-600">
                {t('profile.settings.themeDesc')}
              </p>
            </div>
            <Select value={settings.theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[140px] border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-amber-200 dark:bg-amber-800" />

        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <Label className="text-amber-700 dark:text-amber-400 font-medium">
                {t('profile.settings.notifications')}
              </Label>
              <p className="text-sm text-amber-500 dark:text-amber-600">
                {t('profile.settings.notificationsDesc')}
              </p>
            </div>
          </div>

          <div className="ml-13 space-y-4 pl-13">
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-amber-800 dark:text-amber-300">
                  {t('profile.settings.emailNotifications')}
                </Label>
                <p className="text-xs text-amber-500 dark:text-amber-600">
                  {t('profile.settings.emailNotificationsDesc')}
                </p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-amber-800 dark:text-amber-300">
                  {t('profile.settings.pushNotifications')}
                </Label>
                <p className="text-xs text-amber-500 dark:text-amber-600">
                  {t('profile.settings.pushNotificationsDesc')}
                </p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            {/* Friend Request Notifications */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-amber-800 dark:text-amber-300">
                  {t('profile.settings.friendRequestNotifications')}
                </Label>
                <p className="text-xs text-amber-500 dark:text-amber-600">
                  {t('profile.settings.friendRequestNotificationsDesc')}
                </p>
              </div>
              <Switch
                checked={settings.notifications.friendRequests}
                onCheckedChange={(checked) => handleNotificationChange('friendRequests', checked)}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            {/* Message Notifications */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-amber-800 dark:text-amber-300">
                  {t('profile.settings.messageNotifications')}
                </Label>
                <p className="text-xs text-amber-500 dark:text-amber-600">
                  {t('profile.settings.messageNotificationsDesc')}
                </p>
              </div>
              <Switch
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

ProfileSettings.propTypes = {
  settings: PropTypes.shape({
    language: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
    notifications: PropTypes.shape({
      email: PropTypes.bool.isRequired,
      push: PropTypes.bool.isRequired,
      friendRequests: PropTypes.bool.isRequired,
      messages: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default ProfileSettings;
