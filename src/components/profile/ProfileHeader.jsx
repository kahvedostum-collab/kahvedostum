import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Pencil, Check, X, Camera, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shacdn/avatar';
import { Button } from '@/components/shacdn/button';
import { Input } from '@/components/shacdn/input';
import { Badge } from '@/components/shacdn/badge';
import { formatDateLong } from '@/utils/locale';
import AvatarEditorModal from './AvatarEditorModal';

const ProfileHeader = ({ profile, onUpdate }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.displayName);
  const [editedBio, setEditedBio] = useState(profile.bio);

  // Avatar editing state
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    onUpdate({
      displayName: editedName,
      bio: editedBio,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(profile.displayName);
    setEditedBio(profile.bio);
    setIsEditing(false);
  };

  // Avatar editing handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setIsAvatarEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleAvatarSave = (newAvatarUrl) => {
    onUpdate({ avatarUrl: newAvatarUrl });
    setIsAvatarEditorOpen(false);
    setSelectedImage(null);
  };

  const handleAvatarEditorClose = () => {
    setIsAvatarEditorOpen(false);
    setSelectedImage(null);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const memberSince = formatDateLong(profile.createdAt);

  return (
    <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-2xl p-6 shadow-lg overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="relative group">
          <Avatar className="h-28 w-28 border-4 border-white/30 shadow-xl">
            <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
              {profile.avatarUrl ? null : <User className="h-12 w-12" />}
              {!profile.avatarUrl && getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handleAvatarClick}
            className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-105"
            aria-label={t('profile.changeAvatar')}
          >
            <Camera className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </button>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-xl font-bold max-w-xs"
                placeholder={t('profile.info.displayName')}
              />
              <Input
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 max-w-md"
                placeholder={t('profile.info.bio')}
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {profile.displayName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-none">
                  @{profile.userName}
                </Badge>
                <span className="text-amber-100">•</span>
                <span className="text-amber-100 text-sm">
                  {t('profile.memberSince')}: {memberSince}
                </span>
              </div>
              {profile.bio && (
                <p className="mt-3 text-amber-100 max-w-md">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}
            </>
          )}
        </div>

        {/* Edit Button */}
        <div className="absolute top-4 right-4 md:relative md:top-0 md:right-0">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <Pencil className="h-4 w-4 mr-2" />
              {t('profile.editProfile')}
            </Button>
          )}
        </div>
      </div>

      {/* Avatar Editor Modal */}
      {isAvatarEditorOpen && (
        <AvatarEditorModal
          isOpen={isAvatarEditorOpen}
          onClose={handleAvatarEditorClose}
          onSave={handleAvatarSave}
          imageSrc={selectedImage}
        />
      )}
    </div>
  );
};

ProfileHeader.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    bio: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default ProfileHeader;
