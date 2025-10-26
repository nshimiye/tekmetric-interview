import { BookSearchResult } from '../store/slices/searchSlice';

const SEARCH_CACHE_KEY_PREFIX = 'bookMemo_searchCache';

export interface SearchCache {
  [normalizedQuery: string]: BookSearchResult[];
}

/**
 * Generate cache key for a specific user
 */
function getCacheKey(userId: string | null): string {
  if (!userId) {
    return `${SEARCH_CACHE_KEY_PREFIX}_guest`;
  }
  return `${SEARCH_CACHE_KEY_PREFIX}_${userId}`;
}

/**
 * Load search cache from localStorage for a specific user
 */
export function loadSearchCache(userId: string | null): SearchCache {
  try {
    const cacheKey = getCacheKey(userId);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return {};
    }
    
    const parsed = JSON.parse(cached);
    
    // Validate that it's an object
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('Invalid search cache format in localStorage');
      return {};
    }
    
    return parsed as SearchCache;
  } catch (error) {
    console.error('Failed to load search cache from localStorage:', error);
    return {};
  }
}

/**
 * Save search cache to localStorage for a specific user
 */
export function saveSearchCache(cache: SearchCache, userId: string | null): void {
  try {
    const cacheKey = getCacheKey(userId);
    const serialized = JSON.stringify(cache);
    localStorage.setItem(cacheKey, serialized);
  } catch (error) {
    console.error('Failed to save search cache to localStorage:', error);
  }
}

/**
 * Clear search cache from localStorage for a specific user
 */
export function clearSearchCacheStorage(userId: string | null): void {
  try {
    const cacheKey = getCacheKey(userId);
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Failed to clear search cache from localStorage:', error);
  }
}

/**
 * Get the size of the cache (number of cached queries) for a specific user
 */
export function getSearchCacheSize(userId: string | null): number {
  const cache = loadSearchCache(userId);
  return Object.keys(cache).length;
}

