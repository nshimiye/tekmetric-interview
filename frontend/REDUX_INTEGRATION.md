# Redux Integration Guide

This document explains the Redux integration in the Book Memo application.

## Architecture Overview

The application now uses **Redux Toolkit** (which includes Redux Thunk) for state management. The state is organized into three main slices:

### 1. Library Slice (`src/store/slices/librarySlice.js`)

Manages the user's personal book library.

**State:**
- `items`: Object containing book entries keyed by book ID
- `userId`: Current user's ID

**Actions:**
- `loadLibrary({ userId })`: Load library from localStorage for a user
- `clearLibrary()`: Clear the library (on logout)
- `ensureBookInLibrary(book)`: Add a book to the library if not already present
- `updateBookMemos({ book, memoUpdater })`: Update memos for a book

**Selectors:**
- `selectLibrary(state)`: Get the library items
- `selectLibraryUserId(state)`: Get the current user ID

### 2. Search Slice (`src/store/slices/searchSlice.js`)

Manages book search state and Google Books API integration.

**State:**
- `term`: Current search term
- `status`: Search status ('idle', 'loading', 'success', 'error')
- `results`: Array of search results
- `error`: Error message if search fails
- `lastQuery`: Last executed search query

**Actions:**
- `setSearchTerm(term)`: Update the search term
- `clearSearch()`: Clear search state and term
- `resetSearchState()`: Reset search state but keep term

**Async Thunks:**
- `searchBooks(query)`: Async thunk that fetches books from Google Books API

**Selectors:**
- `selectSearchTerm(state)`: Get current search term
- `selectSearchStatus(state)`: Get search status
- `selectSearchResults(state)`: Get search results
- `selectSearchError(state)`: Get search error
- `selectLastSearchQuery(state)`: Get last query

### 3. Public Memos Slice (`src/store/slices/publicMemosSlice.js`)

Manages public memos shared across users.

**State:**
- `store`: Object containing public memos keyed by book ID

**Actions:**
- `publishMemo({ bookId, memo, author })`: Share a memo publicly
- `unpublishMemo({ bookId, memoId })`: Remove a public memo

**Selectors:**
- `selectPublicMemoStore(state)`: Get the entire public memo store
- `selectPublicMemosForBook(bookId)(state)`: Get public memos for a specific book

## Usage Examples

### Dispatching Actions

```javascript
import { useDispatch } from 'react-redux';
import { ensureBookInLibrary } from '../store/slices/librarySlice';

function MyComponent() {
  const dispatch = useDispatch();
  
  const addBook = (book) => {
    dispatch(ensureBookInLibrary(book));
  };
}
```

### Using Selectors

```javascript
import { useSelector } from 'react-redux';
import { selectLibrary } from '../store/slices/librarySlice';

function MyComponent() {
  const library = useSelector(selectLibrary);
  
  return (
    <div>
      {Object.values(library).map(entry => (
        <div key={entry.book.id}>{entry.book.title}</div>
      ))}
    </div>
  );
}
```

### Async Thunks

```javascript
import { useDispatch } from 'react-redux';
import { searchBooks } from '../store/slices/searchSlice';

function SearchComponent() {
  const dispatch = useDispatch();
  
  const handleSearch = async (query) => {
    try {
      await dispatch(searchBooks(query)).unwrap();
      // Search succeeded
    } catch (error) {
      // Handle error
      console.error('Search failed:', error);
    }
  };
}
```

## Benefits of This Architecture

1. **Centralized State**: All application state is in one place, making it easier to debug and understand data flow
2. **Predictable State Updates**: Actions clearly document how state can change
3. **Built-in DevTools**: Redux DevTools can be used to time-travel through state changes
4. **Separation of Concerns**: Business logic is separated from UI components
5. **Easier Testing**: Pure reducers and action creators are easy to test
6. **Async Handling**: Redux Thunk makes it easy to handle async operations like API calls
7. **Persistence**: State is automatically persisted to localStorage through the slice reducers

## File Structure

```
src/
  store/
    index.js                    # Store configuration
    slices/
      librarySlice.js          # Library state management
      searchSlice.js           # Search state management
      publicMemosSlice.js      # Public memos state management
```

## Migration Notes

The original `AppShell.jsx` had ~720 lines with complex state management. After refactoring:
- State management logic moved to Redux slices (~400 lines total across 3 files)
- `AppShell.jsx` reduced to ~340 lines, focused on UI and event handling
- All helper functions moved to appropriate slices
- Async operations handled by Redux Thunk
- Persistence logic encapsulated in reducers

## Next Steps

Consider these improvements:

1. **Type Safety**: Add TypeScript for better type checking
2. **Optimistic Updates**: Implement optimistic UI updates for better UX
3. **Caching**: Add request caching for search results
4. **Middleware**: Add custom middleware for analytics or logging
5. **Normalized State**: Consider normalizing the library state structure for better performance

