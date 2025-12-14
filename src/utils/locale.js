import i18n from '@/lib/i18n';

/**
 * Locale utility functions for consistent date/time formatting
 * across the application based on the current i18n language.
 */

const LOCALE_MAP = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  ja: 'ja-JP',
  ar: 'ar-SA',
};

/**
 * Get the current locale string based on i18n language
 * @returns {string} Locale string (e.g., 'tr-TR', 'en-US')
 */
export const getLocale = () => {
  return LOCALE_MAP[i18n.language] || 'en-US';
};

/**
 * Format time from a date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time (e.g., '14:30')
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString(getLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date from a date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., '15 Oca' or 'Jan 15')
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(getLocale(), {
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Format date with full month name
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., '15 Ocak' or 'January 15')
 */
export const formatDateLong = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(getLocale(), {
    day: 'numeric',
    month: 'long',
  });
};

/**
 * Format relative time (e.g., "5 minutes ago", "2 days ago")
 * @param {string} dateString - ISO date string
 * @param {function} t - i18n translation function
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString, t) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return t('friends.time.now');
  if (minutes < 60) return t('friends.time.minutesShort', { count: minutes });
  if (hours < 24) return formatTime(dateString);
  if (days < 7) return t('friends.time.daysShort', { count: days });
  return formatDate(dateString);
};
