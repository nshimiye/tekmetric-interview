package com.interview.service;

import com.interview.dto.*;
import com.interview.model.Book;
import com.interview.model.Memo;
import com.interview.model.PublicMemo;
import com.interview.repository.BookRepository;
import com.interview.repository.MemoRepository;
import com.interview.repository.PublicMemoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LibraryService {
    
    @Autowired
    private MemoRepository memoRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private PublicMemoRepository publicMemoRepository;
    
    // Get user's entire library
    public Map<String, LibraryEntryDTO> getUserLibrary(String userId) {
        List<Memo> memos = memoRepository.findByUserId(userId);
        Map<String, List<Memo>> memosByBook = memos.stream()
            .collect(Collectors.groupingBy(Memo::getBookId));
        
        Map<String, LibraryEntryDTO> library = new HashMap<>();
        
        for (Map.Entry<String, List<Memo>> entry : memosByBook.entrySet()) {
            String bookId = entry.getKey();
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                BookDTO bookDTO = convertToBookDTO(book);
                List<MemoDTO> memoDTOs = entry.getValue().stream()
                    .map(this::convertToMemoDTO)
                    .collect(Collectors.toList());
                
                library.put(bookId, new LibraryEntryDTO(bookDTO, memoDTOs));
            }
        }
        
        return library;
    }
    
    // Get memos for a specific book
    public List<MemoDTO> getMemosForBook(String userId, String bookId) {
        List<Memo> memos = memoRepository.findByUserIdAndBookId(userId, bookId);
        return memos.stream()
            .map(this::convertToMemoDTO)
            .collect(Collectors.toList());
    }
    
    // Create a new memo
    @Transactional
    public MemoDTO createMemo(String userId, String bookId, CreateMemoRequest request) {
        // Save or update book information
        BookDTO bookDTO = request.getBook();
        if (bookDTO != null && bookDTO.getId() != null) {
            Book book = convertToBook(bookDTO);
            bookRepository.save(book);
        }
        
        // Create memo
        String memoId = UUID.randomUUID().toString();
        String createdAt = Instant.now().toString();
        
        Memo memo = new Memo(memoId, request.getBody(), createdAt, userId, bookId);
        memo = memoRepository.save(memo);
        
        return convertToMemoDTO(memo);
    }
    
    // Update a memo
    @Transactional
    public MemoDTO updateMemo(String userId, String memoId, UpdateMemoRequest request) {
        Optional<Memo> memoOpt = memoRepository.findById(memoId);
        
        if (!memoOpt.isPresent()) {
            throw new RuntimeException("Memo not found");
        }
        
        Memo memo = memoOpt.get();
        
        if (!memo.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        memo.setBody(request.getBody());
        memo = memoRepository.save(memo);
        
        return convertToMemoDTO(memo);
    }
    
    // Delete a memo
    @Transactional
    public void deleteMemo(String userId, String memoId) {
        Optional<Memo> memoOpt = memoRepository.findById(memoId);
        
        if (!memoOpt.isPresent()) {
            throw new RuntimeException("Memo not found");
        }
        
        Memo memo = memoOpt.get();
        
        if (!memo.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        memoRepository.delete(memo);
    }
    
    // Delete all memos for a book
    @Transactional
    public void deleteMemosForBook(String userId, String bookId) {
        memoRepository.deleteByUserIdAndBookId(userId, bookId);
    }
    
    // Share a memo (make it public)
    @Transactional
    public PublicMemoDTO shareMemo(String userId, String bookId, ShareMemoRequest request) {
        Optional<Memo> memoOpt = memoRepository.findById(request.getMemoId());
        
        if (!memoOpt.isPresent()) {
            throw new RuntimeException("Memo not found");
        }
        
        Memo memo = memoOpt.get();
        
        if (!memo.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        String publicMemoId = UUID.randomUUID().toString();
        String sharedAt = Instant.now().toString();
        String authorName = request.getAuthorName() != null ? request.getAuthorName() : "Anonymous reader";
        
        PublicMemo publicMemo = new PublicMemo(
            publicMemoId,
            memo.getBody(),
            memo.getCreatedAt(),
            sharedAt,
            bookId,
            userId,
            authorName
        );
        
        publicMemo = publicMemoRepository.save(publicMemo);
        
        return convertToPublicMemoDTO(publicMemo);
    }
    
    // Get public memos for a book
    public List<PublicMemoDTO> getPublicMemosForBook(String bookId) {
        List<PublicMemo> publicMemos = publicMemoRepository.findByBookId(bookId);
        return publicMemos.stream()
            .map(this::convertToPublicMemoDTO)
            .collect(Collectors.toList());
    }
    
    // Conversion methods
    private MemoDTO convertToMemoDTO(Memo memo) {
        return new MemoDTO(memo.getId(), memo.getBody(), memo.getCreatedAt());
    }
    
    private BookDTO convertToBookDTO(Book book) {
        return new BookDTO(
            book.getId(),
            book.getTitle(),
            book.getDescription(),
            book.getAuthors(),
            book.getThumbnail(),
            book.getInfoLink(),
            book.getPublishedDate(),
            book.getSource()
        );
    }
    
    private Book convertToBook(BookDTO dto) {
        return new Book(
            dto.getId(),
            dto.getTitle(),
            dto.getDescription(),
            dto.getAuthors(),
            dto.getThumbnail(),
            dto.getInfoLink(),
            dto.getPublishedDate(),
            dto.getSource()
        );
    }
    
    private PublicMemoDTO convertToPublicMemoDTO(PublicMemo publicMemo) {
        MemoAuthorDTO author = new MemoAuthorDTO(publicMemo.getAuthorId(), publicMemo.getAuthorName());
        return new PublicMemoDTO(
            publicMemo.getId(),
            publicMemo.getBody(),
            publicMemo.getCreatedAt(),
            publicMemo.getSharedAt(),
            author
        );
    }
}

