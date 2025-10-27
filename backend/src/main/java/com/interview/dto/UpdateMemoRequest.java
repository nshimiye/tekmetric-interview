package com.interview.dto;

public class UpdateMemoRequest {
    private String body;
    
    public UpdateMemoRequest() {
    }
    
    public UpdateMemoRequest(String body) {
        this.body = body;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
}

