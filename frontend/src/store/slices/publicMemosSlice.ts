import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  loadPublicMemoStore,
  normalizePublicMemoStore,
  savePublicMemoStore,
  type PublicMemo,
  type PublicMemoStore,
  type MemoAuthor,
} from '../../library/publicMemoStorage';
import { type RootState } from '../index';

const arePublicMemoListsEqual = (a: PublicMemo[] = [], b: PublicMemo[] = []): boolean => {
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

const arePublicStoresEqual = (a: PublicMemoStore = {}, b: PublicMemoStore = {}): boolean => {
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

interface MemoInput {
  id?: string;
  body?: string;
  createdAt?: string;
}

const createPublicMemoEntry = (memo: MemoInput, author: MemoAuthor): PublicMemo | null => {
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

export const loadPublicMemos = createAsyncThunk<
  PublicMemoStore,
  void,
  { rejectValue: string }
>('publicMemos/load', async (_, { rejectWithValue }) => {
  try {
    return await loadPublicMemoStore();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load public memos';
    return rejectWithValue(message);
  }
});

const persistPublicMemoStore = (store: PublicMemoStore): void => {
  void savePublicMemoStore(store).catch((error) => {
    console.error('Failed to persist public memo store', error);
  });
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

      const normalizedNext = normalizePublicMemoStore(nextStore);
      if (!arePublicStoresEqual(state.store, normalizedNext)) {
        state.store = normalizedNext;
        persistPublicMemoStore(normalizedNext);
      }
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

      const normalizedNext = normalizePublicMemoStore(nextStore);
      if (!arePublicStoresEqual(state.store, normalizedNext)) {
        state.store = normalizedNext;
        persistPublicMemoStore(normalizedNext);
      }
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
        state.store = normalizePublicMemoStore(action.payload);
      })
      .addCase(loadPublicMemos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Failed to load public memos';
        state.store = {};
      });
  },
});

export const {
  publishMemo,
  unpublishMemo,
} = publicMemosSlice.actions;

export default publicMemosSlice.reducer;

// Selectors
export const selectPublicMemoStore = (state: RootState) => state.publicMemos.store;
export const selectPublicMemoStatus = (state: RootState) => state.publicMemos.status;
export const selectPublicMemoError = (state: RootState) => state.publicMemos.error;
export const selectPublicMemosForBook = (bookId: string) => (state: RootState) => 
  state.publicMemos.store[bookId] ?? [];
