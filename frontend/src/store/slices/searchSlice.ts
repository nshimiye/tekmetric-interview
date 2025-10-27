import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { API_BASE_URL, assertApiResponseOk, isPlainObject } from '../../api/client';
import { loadLibrary, clearLibrary } from './librarySlice';

const MAX_RESULTS = 7;

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

const normalizeQuery = (value: string): string => value.toLowerCase().trim();

const isBookSearchResult = (value: unknown): value is BookSearchResult => {
  if (!isPlainObject(value)) {
    return false;
  }

  const { id, title, authors, description, thumbnail, infoLink, publishedDate, source } = value;
  return (
    typeof id === 'string' &&
    typeof title === 'string' &&
    Array.isArray(authors) &&
    authors.every((author) => typeof author === 'string') &&
    typeof description === 'string' &&
    (typeof thumbnail === 'string' || thumbnail === null) &&
    (typeof infoLink === 'string' || infoLink === null) &&
    typeof publishedDate === 'string' &&
    typeof source === 'string'
  );
};

interface ProxySearchResponse {
  query: string;
  results: BookSearchResult[];
  fromCache: boolean;
}

const parseProxySearchResponse = (payload: unknown): ProxySearchResponse => {
  if (!isPlainObject(payload)) {
    throw new Error('Unexpected search response payload.');
  }

  const { query, results, fromCache } = payload;

  if (typeof query !== 'string') {
    throw new Error('Invalid search response query.');
  }

  if (!Array.isArray(results) || !results.every((item) => isBookSearchResult(item))) {
    throw new Error('Invalid search response results.');
  }

  return {
    query,
    results,
    fromCache: fromCache === true,
  };
};

// Async thunk for searching books
export const searchBooks = createAsyncThunk(
  'search/searchBooks',
  async (query: string, { signal, getState }) => {
    const state = getState() as RootState;
    const normalizedQuery = normalizeQuery(query);
    
    // Check if result is already cached
    const cachedResult = state.search.cache[normalizedQuery];
    if (cachedResult) {
      return {
        results: cachedResult,
        query,
        fromCache: true,
      };
    }

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('maxResults', String(MAX_RESULTS));

    const { currentUserId } = state.search;
    if (currentUserId) {
      params.set('userId', currentUserId);
    }

    const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`, { signal });
    await assertApiResponseOk(response);
    const payload = await response.json();
    const parsed = parseProxySearchResponse(payload);

    return {
      results: parsed.results,
      query: parsed.query,
      fromCache: parsed.fromCache,
    };
  },
);

export const clearSearchCache = createAsyncThunk(
  'search/clearSearchCache',
  async (_: void, { getState }) => {
    const state = getState() as RootState;
    const params = new URLSearchParams();
    const { currentUserId } = state.search;

    if (currentUserId) {
      params.set('userId', currentUserId);
    }

    const queryString = params.toString();
    const response = await fetch(
      `${API_BASE_URL}/search/cache${queryString ? `?${queryString}` : ''}`,
      {
        method: 'DELETE',
      },
    );
    await assertApiResponseOk(response);
  },
);

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
