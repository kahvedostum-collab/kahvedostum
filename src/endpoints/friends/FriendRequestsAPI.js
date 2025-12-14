import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/services/axiosClient';

// POST /api/Friends/requests - Arkadaşlık isteği gönder
export const sendFriendRequest = createAsyncThunk(
  'kahvedostumslice/sendFriendRequest',
  async (targetUserId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Friends/requests', { targetUserId });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'İstek gönderilemedi' } }
      );
    }
  }
);

// POST /api/Friends/requests/{requestId}/cancel - İsteği iptal et
export const cancelFriendRequest = createAsyncThunk(
  'kahvedostumslice/cancelFriendRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await axios.post(`/Friends/requests/${requestId}/cancel`);
      return requestId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'İstek iptal edilemedi' } }
      );
    }
  }
);

// POST /api/Friends/requests/{requestId}/respond - İsteğe yanıt ver (kabul/reddet)
export const respondToFriendRequest = createAsyncThunk(
  'kahvedostumslice/respondToFriendRequest',
  async ({ requestId, accept }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/Friends/requests/${requestId}/respond`, { accept });
      return { requestId, accept, data: response.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Yanıt gönderilemedi' } }
      );
    }
  }
);

// GET /api/Friends/requests/incoming - Gelen istekleri getir
export const fetchIncomingRequests = createAsyncThunk(
  'kahvedostumslice/fetchIncomingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Friends/requests/incoming');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Gelen istekler alınamadı' } }
      );
    }
  }
);

// GET /api/Friends/requests/outgoing - Gönderilen istekleri getir
export const fetchOutgoingRequests = createAsyncThunk(
  'kahvedostumslice/fetchOutgoingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Friends/requests/outgoing');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Gönderilen istekler alınamadı' } }
      );
    }
  }
);

export const FriendRequestsReducer = (builder) => {
  builder
    // sendFriendRequest
    .addCase(sendFriendRequest.pending, (state) => {
      state.friends.isLoading = true;
    })
    .addCase(sendFriendRequest.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      const newRequest = action.payload?.data || action.payload;
      if (newRequest) {
        state.friends.outgoingRequests.push(newRequest);
      }
    })
    .addCase(sendFriendRequest.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload?.error?.message || 'İstek gönderilemedi';
    })
    // cancelFriendRequest
    .addCase(cancelFriendRequest.pending, (state) => {
      state.friends.isLoading = true;
    })
    .addCase(cancelFriendRequest.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      state.friends.outgoingRequests = state.friends.outgoingRequests.filter(
        (req) => req.id !== action.payload
      );
    })
    .addCase(cancelFriendRequest.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload?.error?.message || 'İstek iptal edilemedi';
    })
    // respondToFriendRequest
    .addCase(respondToFriendRequest.pending, (state) => {
      state.friends.isLoading = true;
    })
    .addCase(respondToFriendRequest.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      state.friends.incomingRequests = state.friends.incomingRequests.filter(
        (req) => req.id !== action.payload.requestId
      );
      // Kabul edildiyse arkadaş listesine ekle
      if (action.payload.accept && action.payload.data?.data) {
        state.friends.list.push(action.payload.data.data);
      }
    })
    .addCase(respondToFriendRequest.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload?.error?.message || 'Yanıt gönderilemedi';
    })
    // fetchIncomingRequests
    .addCase(fetchIncomingRequests.pending, (state) => {
      state.friends.isLoading = true;
    })
    .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      state.friends.incomingRequests = action.payload?.data || action.payload || [];
    })
    .addCase(fetchIncomingRequests.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload?.error?.message || 'Gelen istekler alınamadı';
    })
    // fetchOutgoingRequests
    .addCase(fetchOutgoingRequests.pending, (state) => {
      state.friends.isLoading = true;
    })
    .addCase(fetchOutgoingRequests.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      state.friends.outgoingRequests = action.payload?.data || action.payload || [];
    })
    .addCase(fetchOutgoingRequests.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload?.error?.message || 'Gönderilen istekler alınamadı';
    });
};
