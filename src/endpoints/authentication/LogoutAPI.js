import axios from '@/services/axiosClient';
import { getTokens } from '@/services/authService';

/**
 * POST /Auth/Logout - Kullanıcı oturumunu sonlandır
 * Server tarafında refresh token'ı invalidate eder
 */
export const logoutAPI = async () => {
  try {
    const { refreshToken } = getTokens();
    await axios.post('/Auth/Logout', { refreshToken });
    return { success: true };
  } catch (err) {
    // Logout isteği başarısız olsa bile local temizlik yapılmalı
    console.warn('Logout API error:', err);
    return { success: false, error: err };
  }
};
