import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/services/axiosClient';


/* sendFriendRequest REQUEST YAPISI
***********************************/
/*
    {
      "toUserId": 0
    }
*/


/* sendFriendRequest RESPONSE YAPISI
***********************************/
/*
    {
      "success": true,
      "message": "Arkadaşlık isteği gönderildi.",
      "data": null,
      "statusCode": 200
    }
*/

export const sendFriendRequest = createAsyncThunk(
  'kahvedostumslice/sendFriendRequest',
  async (targetUserId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Friends/requests', { toUserId: targetUserId });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'İstek gönderilemedi' } }
      );
    }
  }
);


/* cancelFriendRequest REQUEST YAPISI
***********************************/
/*
    {
      "requestId": 0
    }
*/

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


/* respondToFriendRequest REQUEST YAPISI
***********************************/
/*
  {
    "accept": true
  }
*/

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


/* fetchIncomingRequests RESPONSE YAPISI
***********************************/
/*
    {
      "success": true,
      "message": "Gelen arkadaşlık istekleri listelendi.",
      "data": [
        {
          "requestId": 1002,
          "fromUserId": 5,
          "fromUserName": "huseyin_yer'_'",
          "fromUserEmail": "huseyin.yer@resolution7.com",
          "createdAt": "2025-12-27T21:57:51.0656909"
        }
      ],
      "statusCode": 200
    }
*/

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

/* fetchOutgoingRequests RESPONSE YAPISI
***********************************/
/*
    {
      "success": true,
      "message": "Giden arkadaşlık istekleri listelendi.",
      "data": [
        {
          "requestId": 1003,
          "fromUserId": 1,
          "fromUserName": "admin",
          "fromUserEmail": "kahvedostum@gmail.com",
          "createdAt": "2025-12-27T22:31:12.0772698"
        }
      ],
      "statusCode": 200
    }
*/

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
        (req) => req.requestId !== action.payload
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
        (req) => req.requestId !== action.payload.requestId
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
