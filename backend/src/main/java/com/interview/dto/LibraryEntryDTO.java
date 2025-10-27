package com.interview.dto;

import java.util.List;

public class LibraryEntryDTO {
    private BookDTO book;
    private List<MemoDTO> memos;
    
    public LibraryEntryDTO() {
    }
    
    public LibraryEntryDTO(BookDTO book, List<MemoDTO> memos) {
        this.book = book;
        this.memos = memos;
    }
    
    public BookDTO getBook() {
        return book;
    }
    
    public void setBook(BookDTO book) {
        this.book = book;
    }
    
    public List<MemoDTO> getMemos() {
        return memos;
    }
    
    public void setMemos(List<MemoDTO> memos) {
        this.memos = memos;
    }
}

