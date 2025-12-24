import { createSlice } from '@reduxjs/toolkit';
import combineReducers from './combineReducers';
import reducer from './reducer';
import { LoginReducer } from '@/endpoints/authentication/LoginAPI';
import { FriendsReducer } from '@/endpoints/friends/FriendsAPI';
import { FriendRequestsReducer } from '@/endpoints/friends/FriendRequestsAPI';
import { MessagesReducer } from '@/endpoints/friends/MessagesAPI';
import { MeReducer } from '@/endpoints/layout/MeAPI';

const initialState = {
  isLogged: false,
  isLoading: false,
  isInitialized: false,
  error: '',
  // Friends state
  friends: {
    list: [],
    incomingRequests: [],
    outgoingRequests: [],
    isLoading: false,
    error: null,
  },
  // Messages state
  messages: {
    conversations: [],
    activeConversation: null,
    activeMessages: [],
    isLoading: false,
    error: null,
  },
  // User details state
  userDetails: {
    data: null,
    isLoading: false,
    error: null,
  },
  // Cafe session state
  cafe: {
    cafeId: null,
    channelKey: null,
    expiresAt: null,
    receiptId: null,
    isConnected: false,
    users: [],
  },
};

const KDSlice = createSlice({
  name: 'kahvedostumslice',
  initialState,
  reducers: reducer,
  extraReducers: (builder) => {
    combineReducers(
      LoginReducer,
      FriendsReducer,
      FriendRequestsReducer,
      MessagesReducer,
      MeReducer
    )(builder);
  },
});

export const {
  resetInitialState,
  setIsLogged,
  setIsInitialized,
  // Friends actions
  setFriendsList,
  setIncomingRequests,
  setOutgoingRequests,
  clearFriendsError,
  // Messages actions
  setActiveConversation,
  setActiveMessages,
  addMessageToActive,
  clearMessagesError,
  // Cafe actions
  setCafeSession,
  clearCafeSession,
  setCafeConnected,
  setCafeUsers,
} = KDSlice.actions;
export default KDSlice.reducer;
