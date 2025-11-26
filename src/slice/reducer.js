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
};

const reducers = {
  setIsLogged: (state, action) => {
    state.isLogged = action.payload;
  },
  setIsInitialized: (state, action) => {
    state.isInitialized = action.payload;
  },
  resetInitialState: () => {
    return { ...initialState, isInitialized: true };
  },
  // Friends sync reducers
  setFriendsList: (state, action) => {
    state.friends.list = action.payload;
  },
  setIncomingRequests: (state, action) => {
    state.friends.incomingRequests = action.payload;
  },
  setOutgoingRequests: (state, action) => {
    state.friends.outgoingRequests = action.payload;
  },
  clearFriendsError: (state) => {
    state.friends.error = null;
  },
  // Messages sync reducers
  setActiveConversation: (state, action) => {
    state.messages.activeConversation = action.payload;
  },
  setActiveMessages: (state, action) => {
    state.messages.activeMessages = action.payload;
  },
  addMessageToActive: (state, action) => {
    state.messages.activeMessages.push(action.payload);
  },
  clearMessagesError: (state) => {
    state.messages.error = null;
  },
};

export default reducers;
