package com.interview.model;

import javax.persistence.*;

@Entity
@Table(name = "public_memos")
public class PublicMemo {
    
    @Id
    private String id;
    
    @Column(nullable = false, length = 5000)
    private String body;
    
    @Column(nullable = false)
    private String createdAt;
    
    @Column(nullable = false)
    private String sharedAt;
    
    @Column(nullable = false)
    private String bookId;
    
    private String authorId;
    
    @Column(nullable = false)
    private String authorName;
    
    // Constructors
    public PublicMemo() {
    }
    
    public PublicMemo(String id, String body, String createdAt, String sharedAt, 
                      String bookId, String authorId, String authorName) {
        this.id = id;
        this.body = body;
        this.createdAt = createdAt;
        this.sharedAt = sharedAt;
        this.bookId = bookId;
        this.authorId = authorId;
        this.authorName = authorName;
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
    
    public String getSharedAt() {
        return sharedAt;
    }
    
    public void setSharedAt(String sharedAt) {
        this.sharedAt = sharedAt;
    }
    
    public String getBookId() {
        return bookId;
    }
    
    public void setBookId(String bookId) {
        this.bookId = bookId;
    }
    
    public String getAuthorId() {
        return authorId;
    }
    
    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }
    
    public String getAuthorName() {
        return authorName;
    }
    
    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
}

