import { configureStore } from '@reduxjs/toolkit';
import KDSlice from '@/slice/KDSlice';

const store = configureStore({
  reducer: {
    kahvedostumslice: KDSlice,
  },
});

// Make store available globally for axios interceptor
if (typeof window !== 'undefined') {
  window.store = store;
}

export default store;
