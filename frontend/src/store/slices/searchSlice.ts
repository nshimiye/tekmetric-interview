import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

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
  async (query: string, { signal }) => {
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
    };
  },
);

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface SearchState {
  term: string;
  status: SearchStatus;
  results: BookSearchResult[];
  error: string | null;
  lastQuery: string;
}

const initialState: SearchState = {
  term: '',
  status: 'idle',
  results: [],
  error: null,
  lastQuery: '',
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
    },
    
    resetSearchState: (state) => {
      state.status = 'idle';
      state.results = [];
      state.error = null;
      state.lastQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBooks.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.lastQuery = action.meta.arg;
        state.results = [];
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.status = 'success';
        state.results = action.payload.results;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        if (action.error.name === 'AbortError') {
          return;
        }
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong while searching for books.';
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

