import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Memo, LibraryBook, LibraryEntry } from '../../library/libraryStorage';
import { loadUserLibrary, saveUserLibrary } from '../../library/libraryStorage';
import type { RootState } from '../index';

export type { Memo, LibraryBook, LibraryEntry } from '../../library/libraryStorage';

export type LibraryItems = Record<string, LibraryEntry>;

type LibraryStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

const persistLibrary = (userId: string | null, library: LibraryItems): void => {
  if (!userId) {
    return;
  }

  void saveUserLibrary(userId, library).catch((error) => {
    console.error('Failed to persist user library', error);
  });
};

const normalizeAuthors = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((author) => (typeof author === 'string' ? author.trim() : String(author ?? '').trim()))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }

  return [];
};

interface BookInput {
  id?: string;
  title?: string;
  description?: string;
  authors?: unknown;
  author?: unknown;
  thumbnail?: unknown;
  image?: unknown;
  infoLink?: unknown;
  publishedDate?: unknown;
  source?: unknown;
}

const normalizeBookForLibrary = (book: BookInput): LibraryBook | null => {
  if (!book || !book.id) {
    return null;
  }

  const titleValue =
    typeof book.title === 'string' && book.title.trim().length > 0
      ? book.title.trim()
      : 'Untitled';

  return {
    id: String(book.id),
    title: titleValue,
    description: typeof book.description === 'string' ? book.description : '',
    authors: normalizeAuthors(book.authors ?? book.author),
    thumbnail:
      typeof book.thumbnail === 'string'
        ? book.thumbnail
        : typeof book.image === 'string'
          ? book.image
          : null,
    infoLink: typeof book.infoLink === 'string' ? book.infoLink : null,
    publishedDate: typeof book.publishedDate === 'string' ? book.publishedDate : null,
    source: typeof book.source === 'string' ? book.source : null,
  };
};

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

export const loadLibrary = createAsyncThunk<
  { userId: string | null; library: LibraryItems },
  { userId: string | null },
  { rejectValue: string }
>('library/load', async ({ userId }, { rejectWithValue }) => {
  if (!userId) {
    return { userId: null, library: {} };
  }

  try {
    const library = await loadUserLibrary(userId);
    return { userId, library };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load user library';
    return rejectWithValue(message);
  }
});

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
    
    ensureBookInLibrary: (state, action: PayloadAction<BookInput>) => {
      if (!state.userId) {
        return;
      }

      const normalized = normalizeBookForLibrary(action.payload);
      if (!normalized) {
        return;
      }

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
      persistLibrary(state.userId, state.items);
    },
    
    addMemo: (state, action: PayloadAction<{ book: BookInput; memo: Memo }>) => {
      if (!state.userId) {
        return;
      }

      const { book, memo } = action.payload;
      const normalized = normalizeBookForLibrary(book);
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

      persistLibrary(state.userId, state.items);
    },
    
    updateMemo: (state, action: PayloadAction<{ book: BookInput; memoId: string; updatedMemo: Memo }>) => {
      if (!state.userId) {
        return;
      }

      const { book, memoId, updatedMemo } = action.payload;
      const normalized = normalizeBookForLibrary(book);
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

      persistLibrary(state.userId, state.items);
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

export const {
  clearLibrary,
  ensureBookInLibrary,
  addMemo,
  updateMemo,
} = librarySlice.actions;

export default librarySlice.reducer;

// Selectors
export const selectLibrary = (state: RootState) => state.library.items;
export const selectLibraryUserId = (state: RootState) => state.library.userId;
export const selectLibraryStatus = (state: RootState) => state.library.status;
export const selectLibraryError = (state: RootState) => state.library.error;
