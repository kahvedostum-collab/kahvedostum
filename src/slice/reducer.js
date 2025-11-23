const initialState = {
  isLogged: false,
  isLoading: false,
  error: '',
};

const reducers = {
  setIsLogged: (state, action) => {
    state.isLogged = action.payload;
  },
  resetInitialState: () => {
    return initialState;
  },
};

export default reducers;
