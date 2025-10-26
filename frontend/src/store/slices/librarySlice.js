import { createSlice } from '@reduxjs/toolkit';
import { loadUserLibrary, saveUserLibrary } from '../../library/libraryStorage';

const normalizeAuthors = (value) => {
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

const normalizeBookForLibrary = (book) => {
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

const areAuthorsEqual = (a = [], b = []) => {
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

const areBooksEqual = (a, b) => {
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

const initialState = {
  items: {},
  userId: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    loadLibrary: (state, action) => {
      const { userId } = action.payload;
      state.userId = userId;
      
      if (!userId) {
        state.items = {};
        return;
      }

      const storedLibrary = loadUserLibrary(userId);
      if (storedLibrary && typeof storedLibrary === 'object') {
        state.items = storedLibrary;
      } else {
        state.items = {};
      }
    },
    
    clearLibrary: (state) => {
      state.items = {};
      state.userId = null;
    },
    
    ensureBookInLibrary: (state, action) => {
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

      const nextEntry = existing
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
      saveUserLibrary(state.userId, state.items);
    },
    
    updateBookMemos: (state, action) => {
      if (!state.userId) {
        return;
      }

      const { book, memoUpdater } = action.payload;
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
      const nextMemos = memoUpdater(currentMemos);

      state.items[normalized.id] = {
        book: existing.book,
        memos: nextMemos,
      };

      saveUserLibrary(state.userId, state.items);
    },
  },
});

export const {
  loadLibrary,
  clearLibrary,
  ensureBookInLibrary,
  updateBookMemos,
} = librarySlice.actions;

export default librarySlice.reducer;

// Selectors
export const selectLibrary = (state) => state.library.items;
export const selectLibraryUserId = (state) => state.library.userId;

