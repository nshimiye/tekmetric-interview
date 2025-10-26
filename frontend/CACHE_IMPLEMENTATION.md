# Search Cache Implementation

## Overview
This document describes the frontend caching implementation for the book search feature. Since books don't change over time, search results are now cached to avoid making redundant API calls to Google Books API.

## Features Implemented

### 1. **User-Specific Cache Storage with LocalStorage Persistence**
- Search results are cached in Redux state using a normalized query key (lowercase, trimmed)
- **Each user has their own separate cache** stored with a unique localStorage key
- Cache key format: `bookMemo_searchCache_{userId}`
- Cache is persisted to localStorage, surviving page refreshes and logout/login cycles
- Each unique search query is cached separately per user
- Cache is automatically loaded from localStorage when the user logs in

### 2. **Cache-First Search Strategy**
- When a user searches for books, the system first checks if the results are already cached
- If cached results exist, they are returned immediately (no API call)
- If not cached, the API call is made and results are stored in the cache

### 3. **User-Friendly Cache Notification**
- When search results are loaded from cache, a helpful message appears:
  - "These books were loaded from your previous search. Don't see what you're looking for? Try searching again for fresh results."
- This provides transparency and guidance to users

### 4. **Retry Search Button**
- A "Retry search" button appears when viewing cached results
- Clicking this button:
  - Clears the cache for that query
  - Immediately fetches fresh results from the API
- Button is styled as primary (blue) to stand out
- Includes a tooltip: "Search again for fresh results"

## Technical Implementation

### New Files

#### 1. `src/storage/searchCacheStorage.ts`
**Purpose:** Handles localStorage persistence for search cache

**Functions:**
- `loadSearchCache(userId)`: Loads cache from localStorage for a specific user
- `saveSearchCache(cache, userId)`: Saves cache to localStorage for a specific user
- `clearSearchCacheStorage(userId)`: Removes cache from localStorage for a specific user
- `getSearchCacheSize(userId)`: Returns the number of cached queries for a specific user
- `getCacheKey(userId)`: Generates user-specific cache key

**Key Features:**
- Error handling for localStorage access failures
- Data validation to ensure cache integrity
- User-specific cache keys: `bookMemo_searchCache_{userId}`
- Guest users get a separate cache: `bookMemo_searchCache_guest`

### Modified Files

#### 1. `src/store/slices/searchSlice.ts`
**Changes:**
- Added `cache` object to store query → results mapping
- Added `currentUserId` to track the current user for cache operations
- Added `lastResultFromCache` flag to track if current results came from cache
- Modified `searchBooks` thunk to check cache before making API calls
- Added `setCurrentUser` action to set current user and load their cache
- Added `clearSearchCache` reducer action that also clears localStorage for current user
- Added selectors: `selectSearchCacheSize` and `selectLastResultFromCache`
- Integrated localStorage: loads cache when user is set, saves after each new search

**Key Logic:**
```typescript
// Check cache before fetching
const normalizedQuery = query.toLowerCase().trim();
const cachedResult = state.search.cache[normalizedQuery];
if (cachedResult) {
  return {
    results: cachedResult,
    query,
    fromCache: true,
  };
}
```

#### 2. `src/screens/HomeScreen.tsx`
**Changes:**
- Added `searchCacheSize` and `lastResultFromCache` selectors
- Added `searchBooks` import to re-run searches
- Added `clearCache` callback that:
  1. Clears the cache (Redux + localStorage)
  2. Re-runs the search to fetch fresh results
- Passed new props to `SearchResultsPanel`: `cacheSize`, `lastResultFromCache`, and `onClearCache`

#### 3. `src/screens/components/SearchResultsPanel.tsx`
**Changes:**
- Added new props: `cacheSize`, `lastResultFromCache`, and `onClearCache`
- Added helpful cache notification message
- Added "Retry search" primary button that appears when viewing cached results
- Button triggers cache clear + fresh search

#### 4. `src/components/AppShell.tsx`
**Changes:**
- Integrated `setCurrentUser` action dispatch on user login
- Dispatches user ID when user authenticates
- Clears user ID on logout
- Ensures cache is loaded for the correct user on authentication state changes

## User Experience

### Search Flow
1. User enters a search query and submits
2. System checks if query was previously searched
3. If cached:
   - Results appear instantly
   - "Loaded from cache" indicator is shown
4. If not cached:
   - API call is made to Google Books
   - Results are displayed and cached for future use

### Cache Management
1. User can see how many searches are cached by looking at the "Clear cache" button
2. Clicking "Clear cache" removes all cached searches
3. After clearing, the next search will make a fresh API call
4. Cache automatically clears when user logs out (session ends)

## Benefits

1. **Faster Response Time**: Instant results for repeated searches
2. **Reduced API Calls**: Saves bandwidth and respects API rate limits
3. **Better UX**: Users get immediate feedback for queries they've already made
4. **Transparency**: Users can see when results come from cache
5. **Control**: Users can manually clear cache if needed (e.g., to see fresh results)
6. **User Privacy**: Each user has their own isolated cache - users never see each other's cached results
7. **Multi-User Support**: Multiple users on the same device can have separate caches
8. **Persistent Across Sessions**: Cache survives logout/login cycles for each user

## Cache Behavior

### Cache Key Normalization
- Queries are normalized (lowercase, trimmed) before caching
- "Harry Potter" and "harry potter" will use the same cache entry
- User-specific cache keys ensure isolation between users
- Format: `bookMemo_searchCache_{userId}` for authenticated users
- Format: `bookMemo_searchCache_guest` for non-authenticated users

### Cache Persistence
- **Cache persists across sessions via localStorage**
- Cache survives:
  - Page refreshes
  - Browser restarts
  - Logout/login cycles
- Cache is cleared when:
  - User manually clicks "Retry search" (clears only that query, then re-fetches)
  - User clears browser data/localStorage
  - Cache storage errors occur (automatic fallback)

### Cache Size
- No explicit limit on cache size
- In practice, limited by browser memory
- For typical usage (dozens of searches), memory impact is negligible
- Each book result is ~500 bytes, so even 100 cached searches would be ~350KB

## Testing the Feature

1. **Test Caching:**
   - Search for "JavaScript"
   - Note the API call in Network tab
   - Search for "JavaScript" again
   - Should see helpful message and "Retry search" button
   - No new API call should be made

2. **Test Cache Persistence (localStorage):**
   - Search for "Python"
   - Refresh the page
   - Search for "Python" again
   - Should still use cached results (no API call)
   - Logout and login again
   - Search for "Python" once more
   - Should STILL use cached results!

3. **Test Retry Search:**
   - Search for "JavaScript"
   - Search again to see cached results
   - Click "Retry search" button
   - Should see a new API call in Network tab
   - Fresh results displayed

4. **Test Case Insensitivity:**
   - Search for "Python"
   - Search for "python" (lowercase)
   - Second search should use cached results from the first

5. **Test Cross-Session Persistence:**
   - Search for "React" and "Vue"
   - Close the browser completely
   - Open browser and navigate to the app
   - Search for "React" - should use cache
   - Search for "Vue" - should use cache

6. **Test User-Specific Caching:**
   - Login as User A
   - Search for "JavaScript"
   - Logout
   - Login as User B
   - Search for "JavaScript" - should NOT use cache (new API call)
   - Search for "Python"
   - Logout and login as User A again
   - Search for "JavaScript" - should use cache from User A's previous session
   - Search for "Python" - should NOT use cache (User B's cache)

## Future Enhancements (Optional)

1. ✅ **Persistent Cache**: ~~Store cache in localStorage to persist across sessions~~ **IMPLEMENTED**
2. **Cache Expiration**: Add timestamps and expire cached results after a certain time (e.g., 24 hours)
3. **Cache Size Limit**: Implement LRU (Least Recently Used) cache eviction to prevent unlimited growth
4. **Individual Query Cache Clear**: Allow users to clear specific cached queries (not all)
5. **Cache Statistics**: Show cache hit/miss ratio in developer tools
6. **Cache Export/Import**: Allow users to export/import their cache data
7. **Smart Cache Invalidation**: Detect when user hasn't found results and automatically suggest retry

