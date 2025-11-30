import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

// Pintura imports
import '@pqina/pintura/pintura.css';
import {
  getEditorDefaults,
  createDefaultImageReader,
  createDefaultImageWriter,
} from '@pqina/pintura';
import { PinturaEditor } from '@pqina/react-pintura';

// shadcn Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shacdn/dialog';
import { Button } from '@/components/shacdn/button';

const AvatarEditorModal = ({ isOpen, onClose, onSave, imageSrc }) => {
  const { t } = useTranslation();

  // Pintura editor configuration for avatar editing
  const editorDefaults = getEditorDefaults();

  const editorConfig = {
    ...editorDefaults,
    imageReader: createDefaultImageReader(),
    imageWriter: createDefaultImageWriter({
      targetSize: {
        width: 400,
        height: 400,
        fit: 'cover',
      },
      mimeType: 'image/jpeg',
      quality: 0.9,
    }),
    // Force 1:1 aspect ratio for profile photos
    imageCropAspectRatio: 1,
    // Crop tool settings
    cropEnableButtonRotateLeft: true,
    cropEnableButtonRotateRight: true,
    cropEnableButtonFlipHorizontal: true,
    cropEnableButtonFlipVertical: true,
    cropEnableZoomInput: true,
    // Circular mask for profile photo preview
    cropMaskOpacity: 0.9,
    // Only show crop tool for avatar editing
    utils: ['crop'],
    // Localization
    locale: {
      ...editorDefaults.locale,
      labelButtonExport: t('profile.avatarEditor.save'),
    },
  };

  const handleProcess = (result) => {
    // Convert processed image to base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      onSave(reader.result);
      onClose();
    };
    reader.readAsDataURL(result.dest);
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0 [&>button]:hidden">
        <DialogHeader className="px-4 py-3 border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-800 dark:text-amber-300">
              {t('profile.avatarEditor.title')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="pintura-compact-editor" style={{ height: '450px' }}>
          <PinturaEditor
            {...editorConfig}
            src={imageSrc}
            onProcess={handleProcess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

AvatarEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  imageSrc: PropTypes.string,
};

AvatarEditorModal.defaultProps = {
  imageSrc: null,
};

export default AvatarEditorModal;
