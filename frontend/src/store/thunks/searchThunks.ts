import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../api/client';
import type { RootState } from '../index';
import type { BookSearchResult } from '../slices/searchSlice';

const MAX_RESULTS = 7;

export const normalizeQuery = (value: string): string => value.toLowerCase().trim();

interface ProxySearchResponse {
  query: string;
  results: BookSearchResult[];
  fromCache: boolean;
}

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
    const payload = (await response.json()) as ProxySearchResponse;

    return {
      results: payload.results,
      query: payload.query,
      fromCache: payload.fromCache,
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
    await fetch(
      `${API_BASE_URL}/search/cache${queryString ? `?${queryString}` : ''}`,
      {
        method: 'DELETE',
      },
    );
  },
);

export default {
  searchBooks,
  clearSearchCache,
};
