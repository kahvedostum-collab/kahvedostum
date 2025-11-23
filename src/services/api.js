import axiosClient from './axiosClient';

const apiService = {
  get: async (url, params, headers) => {
    const response = await axiosClient.get(url, { params, headers });
    return ({
      data: response.data,
      status: response.status,
    });
  },

  post: async (url, data, headers) => {
    const response = await axiosClient.post(url, data, { headers });
    return ({
      data: response.data,
      status: response.status,
    });
  },

  put: async (url, data, headers) => {
    const response = await axiosClient.put(url, data, { headers });
    return ({
      data: response.data,
      status: response.status,
    });
  },

  delete: async (url, data, headers, config) => {
    const response = await axiosClient
      .delete(url, { headers, data, ...config });
    return ({
      data: response.data,
      status: response.status,
    });
  },

  // Yeni postFormData yöntemi
  postFormData: async (url, formData, headers, config) => {
    const response = await axiosClient
      .post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
        ...config,
      });
    return ({
      data: response.data,
      status: response.status,
    });
  },
};

export default apiService;
