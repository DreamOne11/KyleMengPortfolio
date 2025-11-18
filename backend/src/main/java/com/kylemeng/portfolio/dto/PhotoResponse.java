package com.kylemeng.portfolio.dto;

import com.kylemeng.portfolio.entity.Photo;

import java.time.LocalDateTime;

public class PhotoResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String filePath;
    private String thumbnailPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public PhotoResponse() {}
    
    // Constructor from entity
    public PhotoResponse(Photo photo) {
        this.id = photo.getId();
        this.categoryId = photo.getCategory() != null ? photo.getCategory().getId() : null;
        this.categoryName = photo.getCategory() != null ? photo.getCategory().getDisplayName() : null;
        this.title = photo.getTitle();
        this.filePath = photo.getFilePath();
        this.thumbnailPath = photo.getThumbnailPath();
        this.createdAt = photo.getCreatedAt();
        this.updatedAt = photo.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }

    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getThumbnailPath() {
        return thumbnailPath;
    }
    
    public void setThumbnailPath(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}