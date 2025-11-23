import { createSlice } from '@reduxjs/toolkit';
import combineReducers from './combineReducers';
import reducer from './reducer';
import { LoginReducer } from '@/endpoints/authentication/LoginAPI';

const initialState = {
  isLogged: false,
  isLoading: false,
  error: '',
};

const KDSlice = createSlice({
  name: 'kahvedostumslice',
  initialState,
  reducers: reducer,
  extraReducers: (builder) => {
    combineReducers(
      LoginReducer
    )(builder);
  },
});

export const { resetInitialState, setIsLogged } = KDSlice.actions;
export default KDSlice.reducer;
