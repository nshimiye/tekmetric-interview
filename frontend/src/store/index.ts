import { configureStore } from '@reduxjs/toolkit';
import libraryReducer from './slices/librarySlice';
import searchReducer from './slices/searchSlice';
import publicMemosReducer from './slices/publicMemosSlice';

export const store = configureStore({
  reducer: {
    // Stores the user's book library and their memos for each book
    library: libraryReducer,
    // Handles book search state, cached results, and queries
    search: searchReducer,
    // Manages shared/public memos from all users
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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

