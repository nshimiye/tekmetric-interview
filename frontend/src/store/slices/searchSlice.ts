import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { loadSearchCache, saveSearchCache, clearSearchCacheStorage } from '../../storage/searchCacheStorage';

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

interface VolumeInfo {
  title?: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  infoLink?: string;
  canonicalVolumeLink?: string;
  publishedDate?: string;
  industryIdentifiers?: Array<{ identifier?: string }>;
}

interface Volume {
  id?: string;
  volumeInfo?: VolumeInfo;
}

interface GoogleBooksResponse {
  items?: Volume[];
}

const mapVolumeToResult = (volume: Volume): BookSearchResult => {
  const info = volume.volumeInfo ?? {};
  const fallbackId = `volume-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2, 10)}`;
  const generatedId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : fallbackId;

  return {
    id:
      volume.id ??
      info.industryIdentifiers?.[0]?.identifier ??
      generatedId,
    title: info.title ?? 'Untitled',
    authors: info.authors ?? [],
    description: info.description ?? '',
    thumbnail:
      info.imageLinks?.thumbnail ??
      info.imageLinks?.smallThumbnail ??
      null,
    infoLink: info.infoLink ?? info.canonicalVolumeLink ?? null,
    publishedDate: info.publishedDate ?? '',
    source: 'google-books',
  };
};

// Async thunk for searching books
export const searchBooks = createAsyncThunk(
  'search/searchBooks',
  async (query: string, { signal, getState }) => {
    const state = getState() as RootState;
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check if result is already cached
    const cachedResult = state.search.cache[normalizedQuery];
    if (cachedResult) {
      return {
        results: cachedResult,
        query,
        fromCache: true,
      };
    }

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query,
      )}&maxResults=${MAX_RESULTS}&printType=books`,
      { signal },
    );

    if (!response.ok) {
      throw new Error('Unable to fetch books right now.');
    }

    const data: GoogleBooksResponse = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    return {
      results: items.map(mapVolumeToResult),
      query,
      fromCache: false,
    };
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
  cache: {}, // Will be loaded after user is set
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
    
    setCurrentUser: (state, action: PayloadAction<string | null>) => {
      state.currentUserId = action.payload;
      // Load cache for this user
      state.cache = loadSearchCache(action.payload);
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
    
    clearSearchCache: (state) => {
      state.cache = {};
      state.lastResultFromCache = false;
      // Clear from localStorage for current user
      clearSearchCacheStorage(state.currentUserId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBooks.pending, (state, action) => {
        const normalizedQuery = action.meta.arg.toLowerCase().trim();
        const isCached = !!state.cache[normalizedQuery];
        
        if (!isCached) {
          state.status = 'loading';
          state.results = [];
        }
        state.error = null;
        state.lastQuery = action.meta.arg;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        const normalizedQuery = action.payload.query.toLowerCase().trim();
        state.status = 'success';
        state.results = action.payload.results;
        state.lastResultFromCache = action.payload.fromCache || false;
        
        // Cache the results if not already cached
        if (!action.payload.fromCache) {
          state.cache[normalizedQuery] = action.payload.results;
          // Save to localStorage for current user
          saveSearchCache(state.cache, state.currentUserId);
        }
      })
      .addCase(searchBooks.rejected, (state, action) => {
        if (action.error.name === 'AbortError') {
          return;
        }
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong while searching for books.';
        state.lastResultFromCache = false;
      });
  },
});

export const {
  setSearchTerm,
  setCurrentUser,
  clearSearch,
  resetSearchState,
  clearSearchCache,
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

