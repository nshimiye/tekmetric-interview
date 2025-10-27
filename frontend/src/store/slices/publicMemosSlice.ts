import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type PublicMemo, type PublicMemoStore, type MemoAuthor } from '../../api/publicMemos';
import { type RootState } from '../index';
import { loadPublicMemos } from '../thunks/publicMemosThunks';

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
}

const initialState: PublicMemosState = {
  store: {},
  status: 'idle',
  error: null,
};

const publicMemosSlice = createSlice({
  name: 'publicMemos',
  initialState,
  reducers: {
    publishMemo: (state, action: PayloadAction<{ bookId: string; memo: MemoInput; author: MemoAuthor }>) => {
      const { bookId, memo, author } = action.payload;
      
      if (!bookId) {
        return;
      }

      const candidateEntry = createPublicMemoEntry(memo, author);
      if (!candidateEntry) {
        return;
      }

      const existingList = Array.isArray(state.store[bookId])
        ? state.store[bookId]
        : [];
      const existingEntry = existingList.find(
        (entry) => entry.id === candidateEntry.id,
      );

      const entryToPersist = existingEntry
        ? {
            ...candidateEntry,
            sharedAt: existingEntry.sharedAt ?? candidateEntry.sharedAt,
          }
        : candidateEntry;

      const nextList = existingEntry
        ? existingList.map((entry) =>
            entry.id === entryToPersist.id ? entryToPersist : entry,
          )
        : [...existingList, entryToPersist];

      const nextStore = {
        ...state.store,
        [bookId]: nextList,
      };

      state.store = nextStore;
    },
    
    unpublishMemo: (state, action: PayloadAction<{ bookId: string; memoId: string }>) => {
      const { bookId, memoId } = action.payload;
      
      if (!bookId || !memoId) {
        return;
      }

      const existingList = Array.isArray(state.store[bookId])
        ? state.store[bookId]
        : [];
      
      if (existingList.length === 0) {
        return;
      }

      const nextList = existingList.filter((entry) => entry.id !== memoId);
      
      if (nextList.length === existingList.length) {
        return;
      }

      let nextStore: PublicMemoStore;
      if (nextList.length === 0) {
        // Cleanup empty public memo list
        // Example before:
        // state.store = {
        //   "book1": [{ id: memoId, body: "Memo body", ... }],
        //   "book2": [{ id: "memo2", body: "Another Memo", ... }]
        // }
        //
        // Example after removing last memo from "book1":
        // state.store = {
        //   "book2": [{ id: "memo2", body: "Another Memo", ... }]
        // }
        const { [bookId]: _removed, ...rest } = state.store;
        nextStore = rest;
      } else {
        nextStore = {
          ...state.store,
          [bookId]: nextList,
        };
      }

        state.store = nextStore;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPublicMemos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadPublicMemos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.store = action.payload ?? {};
      })
      .addCase(loadPublicMemos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Failed to load public memos';
        state.store = {};
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
