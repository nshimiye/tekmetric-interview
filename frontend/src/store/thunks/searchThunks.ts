import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL, assertApiResponseOk, isPlainObject } from '../../api/client';
import type { RootState } from '../index';
import type { BookSearchResult } from '../slices/searchSlice';

const MAX_RESULTS = 7;

export const normalizeQuery = (value: string): string => value.toLowerCase().trim();

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

export default {
  searchBooks,
  clearSearchCache,
};
