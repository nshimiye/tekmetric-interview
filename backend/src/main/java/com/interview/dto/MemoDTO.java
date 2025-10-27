package com.interview.dto;

public class MemoDTO {
    private String id;
    private String body;
    private String createdAt;
    
    public MemoDTO() {
    }
    
    public MemoDTO(String id, String body, String createdAt) {
        this.id = id;
        this.body = body;
        this.createdAt = createdAt;
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
}

