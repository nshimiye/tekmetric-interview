package com.interview.dto;

public class PublicMemoDTO {
    private String id;
    private String body;
    private String createdAt;
    private String sharedAt;
    private MemoAuthorDTO author;
    
    public PublicMemoDTO() {
    }
    
    public PublicMemoDTO(String id, String body, String createdAt, String sharedAt, MemoAuthorDTO author) {
        this.id = id;
        this.body = body;
        this.createdAt = createdAt;
        this.sharedAt = sharedAt;
        this.author = author;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getSharedAt() {
        return sharedAt;
    }
    
    public void setSharedAt(String sharedAt) {
        this.sharedAt = sharedAt;
    }
    
    public MemoAuthorDTO getAuthor() {
        return author;
    }
    
    public void setAuthor(MemoAuthorDTO author) {
        this.author = author;
    }
}

