import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/services/axiosClient';

export const LoginAPI = createAsyncThunk(
  'kahvedostumslice/LoginAPIHandler',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/Auth/Login',
        {
          userNameOrEmail: credentials.email,
          password: credentials.password,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
      if (response.status ===  200) {
        const { accessToken, refreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return response.status;
      } else {
        return rejectWithValue({ error: { message: 'Invalid credentials' } });
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Network error' } },
      );
    }
  },
);

export const LoginReducer = (builder) => {
  builder
    .addCase(LoginAPI.pending, (state) => {
      state.isLogged = false;
      state.error = '';
      state.isLoading = true;
    })
    .addCase(LoginAPI.fulfilled, (state, action) => {
      state.isLogged = true;
      state.error = '';
      state.isLoading = false;
    })
    .addCase(LoginAPI.rejected, (state, action) => {
      state.isLogged = false;
      state.error =
        action.payload?.error?.message ||
        "An error occurred. Couldn't fetch data.";
      state.isLoading = false;
    });
};
