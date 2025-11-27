import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/services/axiosClient';

// GET /api/Friends - Arkadaş listesini getir
export const fetchFriends = createAsyncThunk(
  'kahvedostumslice/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Friends');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Arkadaş listesi alınamadı' } }
      );
    }
  }
);

// DELETE /api/Friends/{friendUserId} - Arkadaşı sil
export const removeFriend = createAsyncThunk(
  'kahvedostumslice/removeFriend',
  async (friendUserId, { rejectWithValue }) => {
    try {
      await axios.delete(`/Friends/${friendUserId}`);
      return friendUserId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Arkadaş silinemedi' } }
      );
    }
  }
);

export const FriendsReducer = (builder) => {
  builder
    // fetchFriends
    .addCase(fetchFriends.pending, (state) => {
      state.friends.isLoading = true;
      state.friends.error = null;
    })
    .addCase(fetchFriends.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      state.friends.list = action.payload?.data || action.payload || [];
    })
    .addCase(fetchFriends.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload?.error?.message || 'Hata oluştu';
    })
    // removeFriend
    .addCase(removeFriend.pending, (state) => {
      state.friends.isLoading = true;
    })
    .addCase(removeFriend.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      state.friends.list = state.friends.list.filter(
        (friend) => friend.id !== action.payload && friend.userId !== action.payload
      );
    })
    .addCase(removeFriend.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload?.error?.message || 'Arkadaş silinemedi';
    });
};
