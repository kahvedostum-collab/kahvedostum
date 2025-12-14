import axios from 'axios';
import { toast } from 'react-toastify';
import { clearTokens } from '@/services/authService';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.data.status;
          const message = error.response.data.error?.message;
          if (status === 'noAccess' && (message === 'Access denied' || message === 'Permission Not Found')) {
            window.location.href = '/no-access';
          } else if (status === 'Unauthenticated') {
            clearTokens();
            localStorage.setItem('Unauthenticated', 'true');
            window.location.href = '/';
            //console.log('Unauthenticated');
          } else if (status === 'error' && message === 'Invalid email or password.') {
            //console.log('Invalid email or password.');
          } else if (status === 'error' && message === 'Validation error.') {
            //console.log('Validation error!');
          } else if (status === 'noAccess' && message === 'You do not have permission to access this resource.') {
            window.location.href = '/not-found';
            //console.log('You do not have permission to access this resource.');
          } else if (status === 'error' && message === 'Invalid token') {
            window.location.href = '/not-found';
            //console.log('Invalid token');
          } else if (status === 'error' && message === 'Token is not valid') {
            window.location.href = '/not-found';
            //console.log('Invalid token');
          } else if (status === 'error' && message === 'Link is expired') {
            window.location.href = '/not-found';
            //console.log('Link is expired');
          } else if (error.response.data.message === 'Server Error') {
            toast.error('An error occured, please contact to support ?');
          } else {
            //console.log(error.response.data);
          }
        }

        return Promise.reject(error);
      },
    );

// Response interceptor with token refresh
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue'ya alınan request'lerde de _retry işaretle (tekrar refresh loop'a girmemesi için)
        originalRequest._retry = true;
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No refresh token, clear everything and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenExpiresAt');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshTokenExpiresAt');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/Auth/Refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          isRefreshing = false;
          
          return axiosClient(originalRequest);
        } else {
          // Refresh endpoint 200 dışında bir status döndü (beklenmeyen durum)
          const unexpectedError = new Error('Refresh token request returned non-200 status');
          processQueue(unexpectedError, null);
          isRefreshing = false;
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(unexpectedError);
        }
      } catch (refreshError) {
        // Refresh failed, clear everything and redirect
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Clear Redux state by dispatching reset action
        if (window.store) {
          const { resetInitialState } = await import('@/slice/KDSlice');
          window.store.dispatch(resetInitialState());
        }
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
