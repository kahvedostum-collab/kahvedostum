import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Save, Pencil, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shacdn/card';
import { Button } from '@/components/shacdn/button';
import { Input } from '@/components/shacdn/input';
import { Label } from '@/components/shacdn/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/shacdn/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const coffeeOptions = [
  { value: 'turkish', label: 'Türk Kahvesi' },
  { value: 'espresso', label: 'Espresso' },
  { value: 'latte', label: 'Latte' },
  { value: 'cappuccino', label: 'Cappuccino' },
  { value: 'americano', label: 'Americano' },
  { value: 'mocha', label: 'Mocha' },
  { value: 'filter', label: 'Filtre Kahve' },
];

const ProfileInfo = ({ profile, onUpdate }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    email: profile.email,
    bio: profile.bio,
    favoriteCoffee: profile.favoriteCoffee,
    location: profile.location,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      displayName: profile.displayName,
      email: profile.email,
      bio: profile.bio,
      favoriteCoffee: profile.favoriteCoffee,
      location: profile.location,
    });
    setIsEditing(false);
  };

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-900/50 bg-white/95 dark:bg-zinc-900/95">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-amber-700 dark:text-amber-400">
            {t('profile.tabs.info')}
          </CardTitle>
          <CardDescription className="dark:text-amber-500/70">
            {t('profile.info.description')}
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t('profile.editProfile')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {t('profile.info.save')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-amber-700 dark:text-amber-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Name */}
        <div className="space-y-2">
          <Label className="text-amber-700 dark:text-amber-400">
            {t('profile.info.displayName')}
          </Label>
          {isEditing ? (
            <Input
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 focus:ring-amber-500"
            />
          ) : (
            <p className="text-amber-900 dark:text-amber-200 py-2">
              {profile.displayName}
            </p>
          )}
        </div>

        {/* Username (readonly) */}
        <div className="space-y-2">
          <Label className="text-amber-700 dark:text-amber-400">
            {t('profile.info.userName')}
          </Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              @{profile.userName}
            </Badge>
            <span className="text-xs text-amber-500 dark:text-amber-600">
              ({t('profile.info.cannotChange')})
            </span>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-amber-700 dark:text-amber-400">
            {t('profile.info.email')}
          </Label>
          {isEditing ? (
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 focus:ring-amber-500"
            />
          ) : (
            <p className="text-amber-900 dark:text-amber-200 py-2">
              {profile.email}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label className="text-amber-700 dark:text-amber-400">
            {t('profile.info.bio')}
          </Label>
          {isEditing ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 focus:ring-amber-500 min-h-[100px]"
              placeholder={t('profile.info.bioPlaceholder')}
            />
          ) : (
            <p className="text-amber-900 dark:text-amber-200 py-2">
              {profile.bio || <span className="text-amber-400 italic">{t('profile.info.noBio')}</span>}
            </p>
          )}
        </div>

        {/* Favorite Coffee */}
        <div className="space-y-2">
          <Label className="text-amber-700 dark:text-amber-400">
            {t('profile.info.favoriteCoffee')}
          </Label>
          {isEditing ? (
            <Select
              value={formData.favoriteCoffee}
              onValueChange={(value) => handleChange('favoriteCoffee', value)}
            >
              <SelectTrigger className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white">
                <SelectValue placeholder={t('profile.info.selectCoffee')} />
              </SelectTrigger>
              <SelectContent>
                {coffeeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-amber-900 dark:text-amber-200 py-2">
              {coffeeOptions.find((o) => o.value === profile.favoriteCoffee)?.label || profile.favoriteCoffee}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-amber-700 dark:text-amber-400">
            {t('profile.info.location')}
          </Label>
          {isEditing ? (
            <Input
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 focus:ring-amber-500"
              placeholder={t('profile.info.locationPlaceholder')}
            />
          ) : (
            <p className="text-amber-900 dark:text-amber-200 py-2">
              {profile.location || <span className="text-amber-400 italic">{t('profile.info.noLocation')}</span>}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

ProfileInfo.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    bio: PropTypes.string,
    favoriteCoffee: PropTypes.string,
    location: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default ProfileInfo;
