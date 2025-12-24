/**
 * Cafe Session localStorage Service
 * Manages cafe session persistence across page refreshes
 */

const STORAGE_KEY = "kahvedostum_cafe_session";

/**
 * Save cafe session to localStorage
 * @param {Object} session - Session data to save
 * @param {number} session.cafeId - Cafe ID
 * @param {string} session.channelKey - SignalR channel key
 * @param {string} session.expiresAt - ISO date string for expiration
 * @param {string} session.receiptId - Receipt ID
 */
export const saveCafeSession = (session) => {
  try {
    // Validate required fields
    if (!session?.cafeId || !session?.expiresAt) {
      console.error("saveCafeSession: Missing required fields", {
        cafeId: session?.cafeId,
        expiresAt: session?.expiresAt,
        channelKey: session?.channelKey,
      });
      return false;
    }

    const data = {
      cafeId: session.cafeId,
      channelKey: session.channelKey,
      expiresAt: session.expiresAt,
      receiptId: session.receiptId,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Verify write was successful
    const verified = localStorage.getItem(STORAGE_KEY);
    if (!verified) {
      console.error("saveCafeSession: Write verification failed");
      return false;
    }

    console.log("saveCafeSession: Session saved successfully", data);
    return true;
  } catch (error) {
    console.error("Failed to save cafe session:", error);
    return false;
  }
};

/**
 * Load cafe session from localStorage
 * @returns {Object|null} Session data or null if not found/expired
 */
export const loadCafeSession = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored);

    // Check if session has expired
    if (isSessionExpired(session)) {
      clearCafeSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to load cafe session:", error);
    clearCafeSession();
    return null;
  }
};

/**
 * Clear cafe session from localStorage
 */
export const clearCafeSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear cafe session:", error);
    return false;
  }
};

/**
 * Check if session has expired
 * @param {Object} session - Session object with expiresAt
 * @returns {boolean} True if expired
 */
export const isSessionExpired = (session) => {
  if (!session?.expiresAt) return true;

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  return now >= expiresAt;
};

/**
 * Get remaining time until session expires
 * @param {Object} session - Session object with expiresAt
 * @returns {Object|null} { minutes, seconds, expired } or null
 */
export const getSessionTimeRemaining = (session) => {
  if (!session?.expiresAt) return null;

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const diff = expiresAt - now;

  if (diff <= 0) {
    return { expired: true, minutes: 0, seconds: 0 };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { expired: false, minutes, seconds };
};

/**
 * Check if there's an active (non-expired) session
 * @returns {boolean}
 */
export const hasActiveSession = () => {
  const session = loadCafeSession();
  return session !== null && !isSessionExpired(session);
};
