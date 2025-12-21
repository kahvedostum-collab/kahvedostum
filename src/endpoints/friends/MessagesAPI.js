import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/services/axiosClient';

// POST /api/Messages - Mesaj gönder
export const sendMessage = createAsyncThunk(
  'kahvedostumslice/sendMessage',
  async ({ conversationId, content, receiverId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Messages', {
        toUserId: receiverId,
        content,
        conversationId,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Mesaj gönderilemedi' } }
      );
    }
  }
);

// GET /api/Messages/conversations - Konuşmaları getir
export const fetchConversations = createAsyncThunk(
  'kahvedostumslice/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Messages/conversations');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Konuşmalar alınamadı' } }
      );
    }
  }
);

// GET /api/Messages/conversations/{conversationId}/messages - Konuşma mesajlarını getir
export const fetchMessages = createAsyncThunk(
  'kahvedostumslice/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Messages/conversations/${conversationId}/messages`);
      return { conversationId, messages: response.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Mesajlar alınamadı' } }
      );
    }
  }
);

// POST /api/Messages/conversations/seen - Mesajları okundu olarak işaretle
export const markMessagesAsSeen = createAsyncThunk(
  'kahvedostumslice/markMessagesAsSeen',
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.post('/Messages/conversations/seen', { conversationId });
      return conversationId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: { message: 'Mesajlar işaretlenemedi' } }
      );
    }
  }
);

export const MessagesReducer = (builder) => {
  builder
    // sendMessage - isLoading kullanma, ChatView'da isSending local state var
    .addCase(sendMessage.pending, (state) => {
      // Mesaj gönderilirken mevcut mesajları gizlememek için isLoading kullanmıyoruz
    })
    .addCase(sendMessage.fulfilled, (state, action) => {
      const newMessage = action.payload?.data || action.payload;
      if (newMessage) {
        state.messages.activeMessages.push(newMessage);
      }
    })
    .addCase(sendMessage.rejected, (state, action) => {
      state.messages.error = action.payload?.error?.message || 'Mesaj gönderilemedi';
    })
    // fetchConversations
    .addCase(fetchConversations.pending, (state) => {
      state.messages.isLoading = true;
    })
    .addCase(fetchConversations.fulfilled, (state, action) => {
      state.messages.isLoading = false;
      state.messages.conversations = action.payload?.data || action.payload || [];
    })
    .addCase(fetchConversations.rejected, (state, action) => {
      state.messages.isLoading = false;
      state.messages.error = action.payload?.error?.message || 'Konuşmalar alınamadı';
    })
    // fetchMessages
    .addCase(fetchMessages.pending, (state) => {
      state.messages.isLoading = true;
    })
    .addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages.isLoading = false;
      state.messages.activeConversation = action.payload.conversationId;
      state.messages.activeMessages = action.payload.messages?.data || action.payload.messages || [];
    })
    .addCase(fetchMessages.rejected, (state, action) => {
      state.messages.isLoading = false;
      state.messages.error = action.payload?.error?.message || 'Mesajlar alınamadı';
    })
    // markMessagesAsSeen
    .addCase(markMessagesAsSeen.pending, (state) => {
      // Silently handle - no loading state needed for this operation
    })
    .addCase(markMessagesAsSeen.fulfilled, (state, action) => {
      // Konuşmadaki okunmamış sayısını sıfırla
      const conversation = state.messages.conversations.find(
        (c) => c.id === action.payload
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    })
    .addCase(markMessagesAsSeen.rejected, (state, action) => {
      // Silently fail but log for debugging - don't disrupt user experience
      if (import.meta.env.DEV) {
        console.warn('Failed to mark messages as seen:', action.payload);
      }
    });
};
