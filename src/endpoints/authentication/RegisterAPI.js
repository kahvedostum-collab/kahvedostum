import axios from '@/services/axiosClient';

/**
 * POST /register - Yeni kullanıcı kaydı
 */
export const registerAPI = async (userData) => {
  const response = await axios.post('/Auth/Register', userData);
  return response.data;
};
