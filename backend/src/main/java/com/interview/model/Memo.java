package com.interview.model;

import javax.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "memos")
public class Memo {
    
    @Id
    private String id;
    
    @Column(nullable = false, length = 5000)
    private String body;
    
    @Column(nullable = false)
    private String createdAt;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String bookId;
    
    // Constructors
    public Memo() {
    }
    
    public Memo(String id, String body, String createdAt, String userId, String bookId) {
        this.id = id;
        this.body = body;
        this.createdAt = createdAt;
        this.userId = userId;
        this.bookId = bookId;
    }
    
    // Getters and Setters
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
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getBookId() {
        return bookId;
    }
    
    public void setBookId(String bookId) {
        this.bookId = bookId;
    }
}

