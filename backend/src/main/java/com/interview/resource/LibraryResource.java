package com.interview.resource;

import com.interview.dto.*;
import com.interview.service.LibraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = "*")
public class LibraryResource {
    
    @Autowired
    private LibraryService libraryService;
    
    /**
     * Get user's entire library
     * GET /api/library/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, LibraryEntryDTO>> getUserLibrary(@PathVariable String userId) {
        try {
            Map<String, LibraryEntryDTO> library = libraryService.getUserLibrary(userId);
            return ResponseEntity.ok(library);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get memos for a specific book
     * GET /api/library/{userId}/books/{bookId}/memos
     */
    @GetMapping("/{userId}/books/{bookId}/memos")
    public ResponseEntity<List<MemoDTO>> getMemosForBook(
            @PathVariable String userId,
            @PathVariable String bookId) {
        try {
            List<MemoDTO> memos = libraryService.getMemosForBook(userId, bookId);
            return ResponseEntity.ok(memos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create a new memo
     * POST /api/library/{userId}/books/{bookId}/memos
     */
    @PostMapping("/{userId}/books/{bookId}/memos")
    public ResponseEntity<MemoDTO> createMemo(
            @PathVariable String userId,
            @PathVariable String bookId,
            @RequestBody CreateMemoRequest request) {
        try {
            MemoDTO memo = libraryService.createMemo(userId, bookId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(memo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update a memo
     * PUT /api/library/{userId}/memos/{memoId}
     */
    @PutMapping("/{userId}/memos/{memoId}")
    public ResponseEntity<MemoDTO> updateMemo(
            @PathVariable String userId,
            @PathVariable String memoId,
            @RequestBody UpdateMemoRequest request) {
        try {
            MemoDTO memo = libraryService.updateMemo(userId, memoId, request);
            return ResponseEntity.ok(memo);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Memo not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().equals("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a memo
     * DELETE /api/library/{userId}/memos/{memoId}
     */
    @DeleteMapping("/{userId}/memos/{memoId}")
    public ResponseEntity<Void> deleteMemo(
            @PathVariable String userId,
            @PathVariable String memoId) {
        try {
            libraryService.deleteMemo(userId, memoId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Memo not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().equals("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete all memos for a book
     * DELETE /api/library/{userId}/books/{bookId}/memos
     */
    @DeleteMapping("/{userId}/books/{bookId}/memos")
    public ResponseEntity<Void> deleteMemosForBook(
            @PathVariable String userId,
            @PathVariable String bookId) {
        try {
            libraryService.deleteMemosForBook(userId, bookId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Share a memo (make it public)
     * POST /api/library/{userId}/books/{bookId}/memos/share
     */
    @PostMapping("/{userId}/books/{bookId}/memos/share")
    public ResponseEntity<PublicMemoDTO> shareMemo(
            @PathVariable String userId,
            @PathVariable String bookId,
            @RequestBody ShareMemoRequest request) {
        try {
            PublicMemoDTO publicMemo = libraryService.shareMemo(userId, bookId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(publicMemo);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Memo not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().equals("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get public memos for a book
     * GET /api/library/public/books/{bookId}/memos
     */
    @GetMapping("/public/books/{bookId}/memos")
    public ResponseEntity<List<PublicMemoDTO>> getPublicMemosForBook(@PathVariable String bookId) {
        try {
            List<PublicMemoDTO> publicMemos = libraryService.getPublicMemosForBook(bookId);
            return ResponseEntity.ok(publicMemos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

