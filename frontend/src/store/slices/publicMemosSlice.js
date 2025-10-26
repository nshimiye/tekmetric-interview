import { createSlice } from '@reduxjs/toolkit';
import {
  loadPublicMemoStore,
  normalizePublicMemoStore,
  savePublicMemoStore,
} from '../../library/publicMemoStorage';

const arePublicMemoListsEqual = (a = [], b = []) => {
  if (a === b) {
    return true;
  }

  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((entry, index) => {
    const other = b[index];
    if (!other) {
      return false;
    }

    const entryAuthor = entry.author ?? {};
    const otherAuthor = other.author ?? {};

    return (
      entry.id === other.id &&
      entry.body === other.body &&
      entry.createdAt === other.createdAt &&
      entry.sharedAt === other.sharedAt &&
      (entryAuthor.id ?? null) === (otherAuthor.id ?? null) &&
      (entryAuthor.name ?? '') === (otherAuthor.name ?? '')
    );
  });
};

const arePublicStoresEqual = (a = {}, b = {}) => {
  if (a === b) {
    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }

    return arePublicMemoListsEqual(a[key], b[key]);
  });
};

const createPublicMemoEntry = (memo, author) => {
  if (!memo || typeof memo !== 'object') {
    return null;
  }

  const { id, body, createdAt } = memo;
  if (typeof id !== 'string' || id.trim().length === 0) {
    return null;
  }

  const trimmedBody = typeof body === 'string' ? body.trim() : '';
  if (trimmedBody.length === 0) {
    return null;
  }

  const memoCreatedAt =
    typeof createdAt === 'string' && createdAt.trim().length > 0
      ? createdAt
      : new Date().toISOString();

  const authorId =
    author && typeof author.id === 'string' && author.id.trim().length > 0
      ? author.id.trim()
      : null;
  const authorName =
    author && typeof author.name === 'string' && author.name.trim().length > 0
      ? author.name.trim()
      : 'Anonymous reader';

  return {
    id: id.trim(),
    body: trimmedBody,
    createdAt: memoCreatedAt,
    author: { id: authorId, name: authorName },
    sharedAt: new Date().toISOString(),
  };
};

const initialState = {
  store: loadPublicMemoStore(),
};

const publicMemosSlice = createSlice({
  name: 'publicMemos',
  initialState,
  reducers: {
    publishMemo: (state, action) => {
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

      const normalizedNext = normalizePublicMemoStore(nextStore);
      if (!arePublicStoresEqual(state.store, normalizedNext)) {
        state.store = normalizedNext;
        savePublicMemoStore(normalizedNext);
      }
    },
    
    unpublishMemo: (state, action) => {
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

      let nextStore;
      if (nextList.length === 0) {
        const { [bookId]: _, ...rest } = state.store;
        nextStore = rest;
      } else {
        nextStore = {
          ...state.store,
          [bookId]: nextList,
        };
      }

      const normalizedNext = normalizePublicMemoStore(nextStore);
      if (!arePublicStoresEqual(state.store, normalizedNext)) {
        state.store = normalizedNext;
        savePublicMemoStore(normalizedNext);
      }
    },
  },
});

export const {
  publishMemo,
  unpublishMemo,
} = publicMemosSlice.actions;

export default publicMemosSlice.reducer;

// Selectors
export const selectPublicMemoStore = (state) => state.publicMemos.store;
export const selectPublicMemosForBook = (bookId) => (state) => 
  state.publicMemos.store[bookId] ?? [];

