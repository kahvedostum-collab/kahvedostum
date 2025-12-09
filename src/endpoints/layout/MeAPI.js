import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/services/axiosClient';

// GET /api/User/Me - Kullanıcı bilgilerini getir
export const fetchMe = createAsyncThunk(
  'kahvedostumslice/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/User/Me');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Kullanıcı bilgileri alınamadı' } }
      );
    }
  }
);

export const MeReducer = (builder) => {
  builder
    .addCase(fetchMe.pending, (state) => {
      state.userDetails.isLoading = true;
      state.userDetails.error = null;
    })
    .addCase(fetchMe.fulfilled, (state, action) => {
      state.userDetails.isLoading = false;
      state.userDetails.data = action.payload?.data || action.payload;
    })
    .addCase(fetchMe.rejected, (state, action) => {
      state.userDetails.isLoading = false;
      state.userDetails.error = action.payload?.error?.message || 'Hata oluştu';
    });
};
