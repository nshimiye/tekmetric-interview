package com.interview.dto;

import java.util.List;

public class BookDTO {
    private String id;
    private String title;
    private String description;
    private List<String> authors;
    private String thumbnail;
    private String infoLink;
    private String publishedDate;
    private String source;
    
    public BookDTO() {
    }
    
    public BookDTO(String id, String title, String description, List<String> authors, 
                   String thumbnail, String infoLink, String publishedDate, String source) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.authors = authors;
        this.thumbnail = thumbnail;
        this.infoLink = infoLink;
        this.publishedDate = publishedDate;
        this.source = source;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<String> getAuthors() {
        return authors;
    }
    
    public void setAuthors(List<String> authors) {
        this.authors = authors;
    }
    
    public String getThumbnail() {
        return thumbnail;
    }
    
    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
    
    public String getInfoLink() {
        return infoLink;
    }
    
    public void setInfoLink(String infoLink) {
        this.infoLink = infoLink;
    }
    
    public String getPublishedDate() {
        return publishedDate;
    }
    
    public void setPublishedDate(String publishedDate) {
        this.publishedDate = publishedDate;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
}

