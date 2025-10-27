# Frontend-Backend Integration Guide

This guide explains how to integrate the Spring Boot backend with your React frontend.

## Overview

The backend provides a REST API that replaces the mock implementations in:
- `frontend/src/library/libraryStorage.ts`
- `frontend/src/library/publicMemoStorage.ts`

## Backend Setup

### 1. Start the Backend Server

```bash
cd backend
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

## Frontend Integration

### 2. Create API Service Layer

Create a new file `frontend/src/api/libraryApi.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';

export const libraryApi = {
  // Get user's entire library
  getUserLibrary: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/library/${userId}`);
    return response.json();
  },

  // Get memos for a specific book
  getMemosForBook: async (userId: string, bookId: string) => {
    const response = await fetch(`${API_BASE_URL}/library/${userId}/books/${bookId}/memos`);
    return response.json();
  },

  // Create a memo
  createMemo: async (userId: string, bookId: string, body: string, book: any) => {
    const response = await fetch(`${API_BASE_URL}/library/${userId}/books/${bookId}/memos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, book }),
    });
    return response.json();
  },

  // Update a memo
  updateMemo: async (userId: string, memoId: string, body: string) => {
    const response = await fetch(`${API_BASE_URL}/library/${userId}/memos/${memoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    return response.json();
  },

  // Delete a memo
  deleteMemo: async (userId: string, memoId: string) => {
    await fetch(`${API_BASE_URL}/library/${userId}/memos/${memoId}`, {
      method: 'DELETE',
    });
  },

  // Delete all memos for a book
  deleteMemosForBook: async (userId: string, bookId: string) => {
    await fetch(`${API_BASE_URL}/library/${userId}/books/${bookId}/memos`, {
      method: 'DELETE',
    });
  },

  // Share a memo
  shareMemo: async (userId: string, bookId: string, memoId: string, authorName: string) => {
    const response = await fetch(`${API_BASE_URL}/library/${userId}/books/${bookId}/memos/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoId, authorName }),
    });
    return response.json();
  },

  // Get public memos for a book
  getPublicMemosForBook: async (bookId: string) => {
    const response = await fetch(`${API_BASE_URL}/library/public/books/${bookId}/memos`);
    return response.json();
  },
};
```

### 3. Update Redux Slices

Modify your Redux slices to use the API instead of localStorage:

#### Update `librarySlice.ts`

Replace localStorage operations with API calls:

```typescript
import { libraryApi } from '../../api/libraryApi';

// Example thunk for loading library
export const loadLibrary = createAsyncThunk(
  'library/load',
  async (userId: string) => {
    const library = await libraryApi.getUserLibrary(userId);
    return library;
  }
);

// Example thunk for adding memo
export const addMemo = createAsyncThunk(
  'library/addMemo',
  async ({ userId, bookId, body, book }: any) => {
    const memo = await libraryApi.createMemo(userId, bookId, body, book);
    return { bookId, memo, book };
  }
);
```

#### Update `publicMemosSlice.ts`

Replace localStorage operations with API calls:

```typescript
import { libraryApi } from '../../api/libraryApi';

export const loadPublicMemos = createAsyncThunk(
  'publicMemos/load',
  async (bookId: string) => {
    const memos = await libraryApi.getPublicMemosForBook(bookId);
    return { bookId, memos };
  }
);

export const shareMemo = createAsyncThunk(
  'publicMemos/share',
  async ({ userId, bookId, memoId, authorName }: any) => {
    const publicMemo = await libraryApi.shareMemo(userId, bookId, memoId, authorName);
    return { bookId, publicMemo };
  }
);
```

## Testing the Integration

### Test Endpoints with curl

```bash
# Get user library
curl http://localhost:8080/api/library/user123

# Create a memo
curl -X POST http://localhost:8080/api/library/user123/books/book456/memos \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This is a great book!",
    "book": {
      "id": "book456",
      "title": "Sample Book",
      "description": "A great read",
      "authors": ["John Doe"],
      "thumbnail": null,
      "infoLink": null,
      "publishedDate": "2023",
      "source": "google"
    }
  }'

# Get public memos for a book
curl http://localhost:8080/api/library/public/books/book456/memos

# Update a memo
curl -X PUT http://localhost:8080/api/library/user123/memos/memo789 \
  -H "Content-Type: application/json" \
  -d '{"body": "Updated memo text"}'

# Delete a memo
curl -X DELETE http://localhost:8080/api/library/user123/memos/memo789
```

## Migration Strategy

### Option 1: Gradual Migration
1. Keep localStorage as fallback
2. Try API calls first, fall back to localStorage on error
3. Migrate data from localStorage to API on first successful connection

### Option 2: Clean Switch
1. Remove localStorage storage files
2. Replace with API service layer
3. Update all Redux slices to use API

### Option 3: Dual Mode (Development)
1. Use environment variable to switch between API and localStorage
2. Useful for development without running backend

Example:
```typescript
const USE_API = process.env.REACT_APP_USE_API === 'true';

export const loadLibrary = USE_API 
  ? libraryApi.getUserLibrary 
  : loadUserLibraryFromLocalStorage;
```

## CORS Configuration

The backend is already configured with `@CrossOrigin(origins = "*")` on the controller, allowing requests from any origin during development.

For production, update the annotation:
```java
@CrossOrigin(origins = "https://your-frontend-domain.com")
```

## Environment Variables

Add to your frontend `.env` file:

```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_USE_API=true
```

## Error Handling

The backend returns standard HTTP status codes:
- `200 OK`: Successful GET/PUT requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `404 Not Found`: Resource not found
- `403 Forbidden`: Unauthorized access
- `500 Internal Server Error`: Server errors

Always handle these in your frontend:

```typescript
try {
  const data = await libraryApi.getUserLibrary(userId);
  return data;
} catch (error) {
  console.error('Failed to load library:', error);
  // Fallback to localStorage or show error message
  throw error;
}
```

## Next Steps

1. Start the backend server
2. Create the API service layer in your frontend
3. Update Redux slices to use the API
4. Test the integration
5. Remove or deprecate localStorage mock implementations
6. Add proper error handling and loading states
7. Consider adding optimistic updates for better UX

## Additional Considerations

### Authentication
Currently, the API uses userId in the URL path. For production:
- Implement proper authentication (JWT, OAuth, etc.)
- Add authorization checks
- Use session-based user identification

### Data Migration
If you have existing localStorage data:
- Create a migration script to POST existing data to the API
- Run it once per user on first API connection
- Clear localStorage after successful migration

### Performance
- Add caching strategies (React Query, RTK Query)
- Implement pagination for large lists
- Consider WebSocket for real-time updates

