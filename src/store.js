import { configureStore } from '@reduxjs/toolkit';
import KDSlice from '@/slice/KDSlice';

const store = configureStore({
  reducer: {
    kahvedostumslice: KDSlice,
  },
});

export default store;
