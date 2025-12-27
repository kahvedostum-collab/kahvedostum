import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/services/axiosClient';
import { setTokens } from '@/services/authService';


/* RESPONSE YAPISI
*************************/
/*
    {
      "success": true,
      "message": "Giriş başarılı.",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDA1IiwidW5pcXVlX25hbWUiOiJheXNlZ3VsZXIxMiIsImVtYWlsIjoiYXlzZS5ndWxlckBrYWh2ZWRvc3R1bS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEwMDUiLCJleHAiOjE3NjY4NzUwMzMsImlzcyI6IkthaHZlRG9zdHVtIiwiYXVkIjoiS2FodmVEb3N0dW1DbGllbnQifQ.ZwOHgILB1jgmvpysZU4IJhtO0nMeaT2JbttZrwY2RKg",
        "refreshToken": "g1G7KSPcfBqQ2nUyBxvrXlgjUpSnHaIj6s5OUwaA5HiIVv8OPO2MeK/w9jodEK7SDZPO+6nn2J6k3oR6+zuW4g=="
      },
      "statusCode": 200
    }
*/


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
        // setTokens: localStorage'a kaydeder + AUTH_EVENTS.LOGIN event'ini tetikler
        setTokens(accessToken, refreshToken);
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
