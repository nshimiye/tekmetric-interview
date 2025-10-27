package com.interview.dto;

public class ShareMemoRequest {
    private String memoId;
    private String authorName;
    
    public ShareMemoRequest() {
    }
    
    public ShareMemoRequest(String memoId, String authorName) {
        this.memoId = memoId;
        this.authorName = authorName;
    }
    
    public String getMemoId() {
        return memoId;
    }
    
    public void setMemoId(String memoId) {
        this.memoId = memoId;
    }
    
    public String getAuthorName() {
        return authorName;
    }
    
    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
}

