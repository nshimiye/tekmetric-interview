import { configureStore } from '@reduxjs/toolkit';
import libraryReducer from './slices/librarySlice';
import searchReducer from './slices/searchSlice';
import publicMemosReducer from './slices/publicMemosSlice';

export const store = configureStore({
  reducer: {
    library: libraryReducer,
    search: searchReducer,
    publicMemos: publicMemosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: [],
      },
    }),
});

export default store;

