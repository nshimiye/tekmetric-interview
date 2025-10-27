# Book Memo API Documentation

This document describes the REST API endpoints for the Book Memo application.

## Base URL
```
http://localhost:8080/api
```

## Endpoints

### 1. Get User's Library
Returns the entire library for a user, including all books and their memos.

**Endpoint:** `GET /api/library/{userId}`

**Response:**
```json
{
  "bookId1": {
    "book": {
      "id": "bookId1",
      "title": "Book Title",
      "description": "Book description",
      "authors": ["Author Name"],
      "thumbnail": "https://...",
      "infoLink": "https://...",
      "publishedDate": "2023-01-01",
      "source": "google"
    },
    "memos": [
      {
        "id": "memoId1",
        "body": "My memo text",
        "createdAt": "2023-01-01T12:00:00Z"
      }
    ]
  }
}
```

---

### 2. Get Memos for a Book
Returns all memos for a specific book.

**Endpoint:** `GET /api/library/{userId}/books/{bookId}/memos`

**Response:**
```json
[
  {
    "id": "memoId1",
    "body": "My memo text",
    "createdAt": "2023-01-01T12:00:00Z"
  }
]
```

---

### 3. Create a Memo
Creates a new memo for a book.

**Endpoint:** `POST /api/library/{userId}/books/{bookId}/memos`

**Request Body:**
```json
{
  "body": "My memo text",
  "book": {
    "id": "bookId1",
    "title": "Book Title",
    "description": "Book description",
    "authors": ["Author Name"],
    "thumbnail": "https://...",
    "infoLink": "https://...",
    "publishedDate": "2023-01-01",
    "source": "google"
  }
}
```

**Response:** (201 Created)
```json
{
  "id": "generatedMemoId",
  "body": "My memo text",
  "createdAt": "2023-01-01T12:00:00Z"
}
```

---

### 4. Update a Memo
Updates an existing memo.

**Endpoint:** `PUT /api/library/{userId}/memos/{memoId}`

**Request Body:**
```json
{
  "body": "Updated memo text"
}
```

**Response:**
```json
{
  "id": "memoId",
  "body": "Updated memo text",
  "createdAt": "2023-01-01T12:00:00Z"
}
```

---

### 5. Delete a Memo
Deletes a specific memo.

**Endpoint:** `DELETE /api/library/{userId}/memos/{memoId}`

**Response:** 204 No Content

---

### 6. Delete All Memos for a Book
Deletes all memos associated with a specific book.

**Endpoint:** `DELETE /api/library/{userId}/books/{bookId}/memos`

**Response:** 204 No Content

---

### 7. Share a Memo (Make Public)
Shares a private memo to the public community.

**Endpoint:** `POST /api/library/{userId}/books/{bookId}/memos/share`

**Request Body:**
```json
{
  "memoId": "memoId1",
  "authorName": "John Doe"
}
```

**Response:** (201 Created)
```json
{
  "id": "publicMemoId",
  "body": "Memo text",
  "createdAt": "2023-01-01T12:00:00Z",
  "sharedAt": "2023-01-02T10:00:00Z",
  "author": {
    "id": "userId",
    "name": "John Doe"
  }
}
```

---

### 8. Get Public Memos for a Book
Returns all public (shared) memos for a specific book.

**Endpoint:** `GET /api/library/public/books/{bookId}/memos`

**Response:**
```json
[
  {
    "id": "publicMemoId",
    "body": "Memo text",
    "createdAt": "2023-01-01T12:00:00Z",
    "sharedAt": "2023-01-02T10:00:00Z",
    "author": {
      "id": "userId",
      "name": "John Doe"
    }
  }
]
```

---

## Error Responses

### 404 Not Found
```json
{
  "status": 404,
  "error": "Not Found"
}
```

### 403 Forbidden (Unauthorized)
```json
{
  "status": 403,
  "error": "Forbidden"
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "error": "Internal Server Error"
}
```

---

## Data Models

### Book
- `id` (string): Unique identifier for the book
- `title` (string): Book title
- `description` (string): Book description
- `authors` (string[]): List of author names
- `thumbnail` (string, nullable): URL to book cover image
- `infoLink` (string, nullable): URL to book information page
- `publishedDate` (string, nullable): Publication date
- `source` (string, nullable): Source of the book data (e.g., "google")

### Memo
- `id` (string): Unique identifier for the memo
- `body` (string): Memo content
- `createdAt` (string): ISO 8601 timestamp of creation

### Public Memo
- `id` (string): Unique identifier for the public memo
- `body` (string): Memo content
- `createdAt` (string): ISO 8601 timestamp of original creation
- `sharedAt` (string): ISO 8601 timestamp of when it was shared
- `author` (object): Author information
  - `id` (string, nullable): Author's user ID
  - `name` (string): Author's display name

---

## Running the Backend

### Prerequisites
- Java 8 or higher
- Maven

### Build and Run
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The server will start on `http://localhost:8080`.

### H2 Console
The H2 database console is available at: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: `password`

