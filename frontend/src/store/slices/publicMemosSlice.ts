import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { type PublicMemo, type PublicMemoStore, type MemoAuthor, type PaginationInfo } from '../../api/publicMemos';
import { type RootState } from '../index';
import { loadMorePublicMemos } from '../thunks/publicMemosThunks';

export type { PublicMemoStore } from '../../api/publicMemos';

export interface MemoInput {
  id: string;
  body: string;
  createdAt: string;
}

const createPublicMemoEntry = (memo: MemoInput, author: MemoAuthor): PublicMemo | null => {
  return {
    id: memo.id,
    body: memo.body,
    createdAt: memo.createdAt,
    author: { id: author.id, name: author.name },
    sharedAt: new Date().toISOString(),
  };
};

type PublicMemoStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface PublicMemosState {
  store: PublicMemoStore;
  status: PublicMemoStatus;
  error: string | null;
  pagination: Record<string, PaginationInfo>;
  loadingMore: Record<string, boolean>;
}

const initialState: PublicMemosState = {
  store: {},
  status: 'idle',
  error: null,
  pagination: {},
  loadingMore: {},
};

const publicMemosSlice = createSlice({
  name: 'publicMemos',
  initialState,
  reducers: {
    publishMemo: (state, action: PayloadAction<{ bookId: string; memo: MemoInput; author: MemoAuthor }>) => {
      const { bookId, memo, author } = action.payload;

      const newEntry = createPublicMemoEntry(memo, author);
      if (!newEntry) return; // ensure no null gets into array
      state.store[bookId] = [...(state.store[bookId] ?? []), newEntry];
    },
    
    unpublishMemo: (state, action: PayloadAction<{ bookId: string; memoId: string }>) => {
      const { bookId, memoId } = action.payload;
      
      if (!Array.isArray(state.store[bookId])) return;
      state.store[bookId] = state.store[bookId].filter((entry) => entry.id !== memoId);
      if (state.store[bookId].length === 0) {
        delete state.store[bookId];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMorePublicMemos.pending, (state, action) => {
        state.loadingMore[action.meta.arg.bookId] = true;
      })
      .addCase(loadMorePublicMemos.fulfilled, (state, action) => {
        const { bookId, memos, pagination } = action.payload;
        state.loadingMore[bookId] = false;
        // Append new memos to existing ones

        const existingMemos = state.store[bookId] ?? [];
        console.log('memos', memos);
        
        for (const memo of memos) {
          if (!existingMemos.some((m) => m.id === memo.id)) {
            existingMemos.push(memo);
          }
        }
        state.store[bookId] = existingMemos;
        // Update pagination info
        state.pagination[bookId] = pagination;
      })
      .addCase(loadMorePublicMemos.rejected, (state, action) => {
        state.loadingMore[action.meta.arg.bookId] = false;
      });
  },
});

const { publishMemo, unpublishMemo } = publicMemosSlice.actions;

export const publicMemosInternalActions = {
  publishMemo,
  unpublishMemo,
};

export default publicMemosSlice.reducer;

// Selectors
export const selectPublicMemoStore = (state: RootState) => state.publicMemos.store;
export const selectPublicMemoStatus = (state: RootState) => state.publicMemos.status;
export const selectPublicMemoError = (state: RootState) => state.publicMemos.error;
export const selectPublicMemosForBook = (bookId: string) => (state: RootState) => 
  state.publicMemos.store[bookId] ?? [];
export const selectPaginationForBook = (bookId: string) => (state: RootState) =>
  state.publicMemos.pagination[bookId] ?? null;
export const selectIsLoadingMoreForBook = (bookId: string) => (state: RootState) =>
  state.publicMemos.loadingMore[bookId] ?? false;

// Memoized parameterized selectors
export const selectSharedMemos = (bookId: string, currentUserId: string) => 
  createSelector(
    [selectPublicMemoStore],
    (store) => {
      const entries = Array.isArray(store[bookId])
        ? store[bookId]
        : [];

      return entries.filter(
        (entry) => (entry?.author?.id ?? null) !== currentUserId,
      );
    }
  );

export const selectCanViewSharedMemos = (bookId: string, currentUserId: string) => 
  createSelector(
    [
      selectPublicMemoStore,
      (state: RootState) => state.library.items[bookId] ?? null,
    ],
    (store, libraryEntry) => {
      const savedMemos = Array.isArray(libraryEntry?.memos) ? libraryEntry.memos : [];
      
      if (savedMemos.length === 0) {
        return false;
      }

      const entries = Array.isArray(store[bookId])
        ? store[bookId]
        : [];

      const sharedMemos = entries.filter(
        (entry) => (entry?.author?.id ?? null) !== currentUserId,
      );

      return sharedMemos.length > 0;
    }
  );
