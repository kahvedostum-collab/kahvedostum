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
  // Cafe session reducers
  setCafeSession: (state, action) => {
    const { cafeId, channelKey, expiresAt, receiptId } = action.payload;
    state.cafe.cafeId = cafeId;
    state.cafe.channelKey = channelKey;
    state.cafe.expiresAt = expiresAt;
    state.cafe.receiptId = receiptId;
  },
  clearCafeSession: (state) => {
    state.cafe.cafeId = null;
    state.cafe.channelKey = null;
    state.cafe.expiresAt = null;
    state.cafe.receiptId = null;
    state.cafe.isConnected = false;
    state.cafe.users = [];
  },
  setCafeConnected: (state, action) => {
    state.cafe.isConnected = action.payload;
  },
  setCafeUsers: (state, action) => {
    state.cafe.users = action.payload;
  },
};

export default reducers;
