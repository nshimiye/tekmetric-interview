import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createSelector } from '@reduxjs/toolkit';
import { normalizeQuery, searchBooks, clearSearchCache } from '../thunks/searchThunks';
import type { RootState } from '../index';
import { loadLibrary } from '../thunks/libraryThunks';
import { clearLibrary } from './librarySlice';

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string | null;
  infoLink: string | null;
  publishedDate: string;
  source: string;
}

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface SearchCache {
  [normalizedQuery: string]: BookSearchResult[];
}

interface SearchState {
  term: string;
  status: SearchStatus;
  results: BookSearchResult[];
  error: string | null;
  lastQuery: string;
  cache: SearchCache;
  lastResultFromCache: boolean;
  currentUserId: string | null;
}

const initialState: SearchState = {
  term: '',
  status: 'idle',
  results: [],
  error: null,
  lastQuery: '',
  cache: {},
  lastResultFromCache: false,
  currentUserId: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.term = action.payload;
    },
    
    clearSearch: (state) => {
      state.term = '';
      state.status = 'idle';
      state.results = [];
      state.error = null;
      state.lastQuery = '';
      state.lastResultFromCache = false;
    },
    
    resetSearchState: (state) => {
      state.status = 'idle';
      state.results = [];
      state.error = null;
      state.lastQuery = '';
      state.lastResultFromCache = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBooks.pending, (state, action) => {
        const normalizedQuery = normalizeQuery(action.meta.arg);
        const isCached = !!state.cache[normalizedQuery];
        
        if (!isCached) {
          state.status = 'loading';
          state.results = [];
        }
        state.error = null;
        state.lastQuery = action.meta.arg;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        const normalizedQuery = normalizeQuery(action.payload.query);
        state.status = 'success';
        state.results = action.payload.results;
        state.lastResultFromCache = action.payload.fromCache || false;
        
        // Cache the results if not already cached
        if (!action.payload.fromCache) {
          state.cache[normalizedQuery] = action.payload.results;
        }
      })
      .addCase(searchBooks.rejected, (state, action) => {
        if (action.error.name === 'AbortError') {
          return;
        }
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong while searching for books.';
        state.lastResultFromCache = false;
      })
      .addCase(loadLibrary.pending, (state, action) => {
        const nextUserId = action.meta.arg.userId ?? null;
        state.currentUserId = nextUserId;
        state.cache = {};
      })
      .addCase(loadLibrary.fulfilled, (state, action) => {
        const nextUserId = action.payload.userId ?? null;
        state.currentUserId = nextUserId;
        state.cache = {};
      })
      .addCase(loadLibrary.rejected, (state, action) => {
        const nextUserId = action.meta.arg.userId ?? null;
        state.currentUserId = nextUserId;
        state.cache = {};
      })
      .addCase(clearLibrary, (state) => {
        state.currentUserId = null;
        state.cache = {};
      })
      .addCase(clearSearchCache.fulfilled, (state) => {
        state.cache = {};
        state.lastResultFromCache = false;
      });
  },
});

export const {
  setSearchTerm,
  clearSearch,
  resetSearchState,
} = searchSlice.actions;

export default searchSlice.reducer;

// Selectors
export const selectSearchTerm = (state: RootState) => state.search.term;
export const selectSearchStatus = (state: RootState) => state.search.status;
export const selectSearchResults = (state: RootState) => state.search.results;
export const selectSearchError = (state: RootState) => state.search.error;
export const selectLastSearchQuery = (state: RootState) => state.search.lastQuery;
export const selectSearchCacheSize = (state: RootState) => Object.keys(state.search.cache).length;
export const selectLastResultFromCache = (state: RootState) => state.search.lastResultFromCache;

// Derived selectors - memoized to prevent unnecessary re-renders
export const selectSafeSearchResults = createSelector(
  [selectSearchResults],
  (results) => {
    return Array.isArray(results) ? results : [];
  }
);

export const selectHasSearchResults = createSelector(
  [selectSearchStatus, selectSafeSearchResults],
  (status, results) => {
    return status === 'success' && results.length > 0;
  }
);

export const selectReadableSearchQuery = createSelector(
  [selectLastSearchQuery],
  (lastQuery) => {
    return lastQuery && lastQuery.trim().length > 0
      ? `"${lastQuery}"`
      : 'your search';
  }
);
