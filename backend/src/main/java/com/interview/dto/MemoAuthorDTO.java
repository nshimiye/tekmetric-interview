package com.interview.dto;

public class MemoAuthorDTO {
    private String id;
    private String name;
    
    public MemoAuthorDTO() {
    }
    
    public MemoAuthorDTO(String id, String name) {
        this.id = id;
        this.name = name;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}

