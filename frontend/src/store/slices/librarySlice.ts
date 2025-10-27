import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { Memo, LibraryBook, LibraryEntry } from '../../api/library';
import type { RootState } from '../index';
import { loadLibrary } from '../thunks/libraryThunks';

export type { Memo, LibraryBook, LibraryEntry } from '../../api/library';

export type LibraryItems = Record<string, LibraryEntry>;

type LibraryStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// export interface BookInput {
//   id?: string;
//   title?: string;
//   description?: string;
//   authors?: unknown;
//   author?: unknown;
//   thumbnail?: unknown;
//   image?: unknown;
//   infoLink?: unknown;
//   publishedDate?: unknown;
//   source?: unknown;
// }



const areAuthorsEqual = (a: string[] = [], b: string[] = []): boolean => {
  if (a === b) {
    return true;
  }

  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((author, index) => author === b[index]);
};

const areBooksEqual = (a: LibraryBook, b: LibraryBook): boolean => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (
    a.id !== b.id ||
    a.title !== b.title ||
    a.description !== b.description ||
    a.thumbnail !== b.thumbnail ||
    a.infoLink !== b.infoLink ||
    a.publishedDate !== b.publishedDate ||
    a.source !== b.source
  ) {
    return false;
  }

  return areAuthorsEqual(a.authors, b.authors);
};

interface LibraryState {
  items: LibraryItems;
  userId: string | null;
  status: LibraryStatus;
  error: string | null;
}

const initialState: LibraryState = {
  items: {},
  userId: null,
  status: 'idle',
  error: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    clearLibrary: (state) => {
      state.items = {};
      state.userId = null;
      state.status = 'idle';
      state.error = null;
    },
    
    addBookToLibrary: (state, action: PayloadAction<LibraryBook>) => {
      const normalized = action.payload;

      const existing = state.items[normalized.id];
      if (existing && areBooksEqual(existing.book, normalized)) {
        return;
      }

      const nextEntry: LibraryEntry = existing
        ? {
            book: {
              ...existing.book,
              ...normalized,
            },
            memos: existing.memos ?? [],
          }
        : {
            book: normalized,
            memos: [],
          };

      state.items[normalized.id] = nextEntry;
    },
    
    addMemo: (state, action: PayloadAction<{ book: LibraryBook; memo: Memo }>) => {
      if (!state.userId) {
        return;
      }

      const { book, memo } = action.payload;
      const normalized = book;
      if (!normalized) {
        return;
      }

      // Ensure book exists in library first
      if (!state.items[normalized.id]) {
        state.items[normalized.id] = {
          book: normalized,
          memos: [],
        };
      }

      const existing = state.items[normalized.id];
      const currentMemos = Array.isArray(existing.memos) ? existing.memos : [];

      state.items[normalized.id] = {
        book: existing.book,
        memos: [...currentMemos, memo],
      };

    },
    
    updateMemo: (state, action: PayloadAction<{ book: LibraryBook; memoId: string; updatedMemo: Memo }>) => {
      if (!state.userId) {
        return;
      }

      const { book, memoId, updatedMemo } = action.payload;
      const normalized = book;
      if (!normalized) {
        return;
      }

      const existing = state.items[normalized.id];
      if (!existing) {
        return;
      }

      const currentMemos = Array.isArray(existing.memos) ? existing.memos : [];
      const nextMemos = currentMemos.map((memo) =>
        memo.id === memoId ? updatedMemo : memo
      );

      state.items[normalized.id] = {
        book: existing.book,
        memos: nextMemos,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLibrary.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.userId = action.meta.arg.userId ?? null;
      })
      .addCase(loadLibrary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.userId = action.payload.userId;
        state.items = action.payload.library ?? {};
      })
      .addCase(loadLibrary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Failed to load user library';
        state.userId = action.meta.arg.userId ?? null;
        state.items = {};
      });
  },
});

const { clearLibrary, addBookToLibrary, addMemo, updateMemo } = librarySlice.actions;

export const libraryInternalActions = {
  addBookToLibrary,
  addMemo,
  updateMemo,
};

export { clearLibrary };

export default librarySlice.reducer;

// Selectors
export const selectLibrary = (state: RootState) => state.library.items;
export const selectLibraryUserId = (state: RootState) => state.library.userId;
export const selectLibraryStatus = (state: RootState) => state.library.status;
export const selectLibraryError = (state: RootState) => state.library.error;
