package com.interview.dto;

public class CreateMemoRequest {
    private String body;
    private BookDTO book;
    
    public CreateMemoRequest() {
    }
    
    public CreateMemoRequest(String body, BookDTO book) {
        this.body = body;
        this.book = book;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
    
    public BookDTO getBook() {
        return book;
    }
    
    public void setBook(BookDTO book) {
        this.book = book;
    }
}

