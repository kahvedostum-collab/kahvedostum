const combineReducers =
  (...extraReducers) =>
  (builder) => {
    extraReducers.forEach((extraReducer) => {
      extraReducer(builder);
    });
  };

export default combineReducers;
