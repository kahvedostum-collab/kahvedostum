/**
 * Auth Service - Merkezi token yönetimi ve event sistemi
 *
 * Bu servis token işlemlerini tek bir yerde toplar ve
 * custom event'ler aracılığıyla diğer bileşenlere bildirim gönderir.
 */

export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESH: 'auth:token_refresh',
};

/**
 * Custom event dispatch helper
 */
const dispatchAuthEvent = (type, detail = {}) => {
  window.dispatchEvent(new CustomEvent(type, { detail }));
};

/**
 * Token'ları al
 */
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
};

/**
 * Token'ları kaydet ve LOGIN event'i emit et
 */
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  dispatchAuthEvent(AUTH_EVENTS.LOGIN, { accessToken });
};

/**
 * Token'ları temizle ve LOGOUT event'i emit et
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessTokenExpiresAt');
  localStorage.removeItem('refreshTokenExpiresAt');
  dispatchAuthEvent(AUTH_EVENTS.LOGOUT);
};

/**
 * Kullanıcı authenticated mi kontrol et
 */
export const isAuthenticated = () => {
  const { accessToken, refreshToken } = getTokens();
  return !!(accessToken && refreshToken);
};

/**
 * Auth event'lerine subscribe ol
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthEvents = (eventType, callback) => {
  window.addEventListener(eventType, callback);
  return () => window.removeEventListener(eventType, callback);
};

/**
 * Token refresh edildiğinde çağrılır
 */
export const onTokenRefresh = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  dispatchAuthEvent(AUTH_EVENTS.TOKEN_REFRESH, { accessToken });
};

export default {
  AUTH_EVENTS,
  getTokens,
  setTokens,
  clearTokens,
  isAuthenticated,
  subscribeToAuthEvents,
  onTokenRefresh,
};
