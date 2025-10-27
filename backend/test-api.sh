#!/bin/bash

# Book Memo API Test Script
# This script tests all the API endpoints

BASE_URL="http://localhost:8080/api"
USER_ID="test-user-123"
BOOK_ID="test-book-456"

echo "======================================"
echo "Book Memo API Test Script"
echo "======================================"
echo ""

# Check if server is running
echo "1. Checking if server is running..."
if curl -s "$BASE_URL/library/$USER_ID" > /dev/null 2>&1; then
    echo "✓ Server is running"
else
    echo "✗ Server is not running. Please start it with: mvn spring-boot:run"
    exit 1
fi
echo ""

# Test 1: Get empty library
echo "2. Testing GET library (should be empty)..."
curl -s -X GET "$BASE_URL/library/$USER_ID" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/library/$USER_ID"
echo ""
echo ""

# Test 2: Create a memo
echo "3. Testing POST new memo..."
MEMO_RESPONSE=$(curl -s -X POST "$BASE_URL/library/$USER_ID/books/$BOOK_ID/memos" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This is a test memo about a great book!",
    "book": {
      "id": "test-book-456",
      "title": "The Great Gatsby",
      "description": "A classic American novel",
      "authors": ["F. Scott Fitzgerald"],
      "thumbnail": "https://example.com/cover.jpg",
      "infoLink": "https://example.com/book",
      "publishedDate": "1925",
      "source": "test"
    }
  }')

echo "$MEMO_RESPONSE" | json_pp 2>/dev/null || echo "$MEMO_RESPONSE"
MEMO_ID=$(echo "$MEMO_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')
echo ""
echo "Created memo ID: $MEMO_ID"
echo ""

# Test 3: Get library with memo
echo "4. Testing GET library (should have one book with memo)..."
curl -s -X GET "$BASE_URL/library/$USER_ID" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/library/$USER_ID"
echo ""
echo ""

# Test 4: Get memos for specific book
echo "5. Testing GET memos for book..."
curl -s -X GET "$BASE_URL/library/$USER_ID/books/$BOOK_ID/memos" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/library/$USER_ID/books/$BOOK_ID/memos"
echo ""
echo ""

# Test 5: Update memo
if [ -n "$MEMO_ID" ]; then
    echo "6. Testing PUT update memo..."
    curl -s -X PUT "$BASE_URL/library/$USER_ID/memos/$MEMO_ID" \
      -H "Content-Type: application/json" \
      -d '{"body": "Updated memo text - this book is amazing!"}' | json_pp 2>/dev/null || curl -s -X PUT "$BASE_URL/library/$USER_ID/memos/$MEMO_ID" \
      -H "Content-Type: application/json" \
      -d '{"body": "Updated memo text - this book is amazing!"}'
    echo ""
    echo ""
fi

# Test 6: Share memo (make public)
if [ -n "$MEMO_ID" ]; then
    echo "7. Testing POST share memo..."
    curl -s -X POST "$BASE_URL/library/$USER_ID/books/$BOOK_ID/memos/share" \
      -H "Content-Type: application/json" \
      -d "{\"memoId\": \"$MEMO_ID\", \"authorName\": \"Test User\"}" | json_pp 2>/dev/null || curl -s -X POST "$BASE_URL/library/$USER_ID/books/$BOOK_ID/memos/share" \
      -H "Content-Type: application/json" \
      -d "{\"memoId\": \"$MEMO_ID\", \"authorName\": \"Test User\"}"
    echo ""
    echo ""
fi

# Test 7: Get public memos
echo "8. Testing GET public memos for book..."
curl -s -X GET "$BASE_URL/library/public/books/$BOOK_ID/memos" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/library/public/books/$BOOK_ID/memos"
echo ""
echo ""

# Test 8: Create another memo
echo "9. Testing POST another memo..."
MEMO2_RESPONSE=$(curl -s -X POST "$BASE_URL/library/$USER_ID/books/$BOOK_ID/memos" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Chapter 3 is particularly interesting!",
    "book": {
      "id": "test-book-456",
      "title": "The Great Gatsby",
      "description": "A classic American novel",
      "authors": ["F. Scott Fitzgerald"],
      "thumbnail": "https://example.com/cover.jpg",
      "infoLink": "https://example.com/book",
      "publishedDate": "1925",
      "source": "test"
    }
  }')

echo "$MEMO2_RESPONSE" | json_pp 2>/dev/null || echo "$MEMO2_RESPONSE"
MEMO2_ID=$(echo "$MEMO2_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')
echo ""
echo ""

# Test 9: Delete specific memo
if [ -n "$MEMO2_ID" ]; then
    echo "10. Testing DELETE specific memo..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/library/$USER_ID/memos/$MEMO2_ID")
    if [ "$HTTP_CODE" = "204" ]; then
        echo "✓ Memo deleted successfully (HTTP 204)"
    else
        echo "✗ Delete failed (HTTP $HTTP_CODE)"
    fi
    echo ""
fi

# Test 10: Get library again
echo "11. Testing GET library (should have one memo remaining)..."
curl -s -X GET "$BASE_URL/library/$USER_ID" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/library/$USER_ID"
echo ""
echo ""

# Test 11: Delete all memos for book
echo "12. Testing DELETE all memos for book..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/library/$USER_ID/books/$BOOK_ID/memos")
if [ "$HTTP_CODE" = "204" ]; then
    echo "✓ All memos deleted successfully (HTTP 204)"
else
    echo "✗ Delete failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 12: Get library (should be empty again)
echo "13. Testing GET library (should be empty)..."
curl -s -X GET "$BASE_URL/library/$USER_ID" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/library/$USER_ID"
echo ""
echo ""

echo "======================================"
echo "✓ All tests completed!"
echo "======================================"

