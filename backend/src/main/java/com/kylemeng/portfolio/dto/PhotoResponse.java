package com.kylemeng.portfolio.dto;

import com.kylemeng.portfolio.entity.Photo;

import java.time.LocalDateTime;

public class PhotoResponse {
    
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String description;
    private String filePath;
    private String thumbnailPath;
    private LocalDateTime takenAt;
    private String location;
    private Long likesCount;
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
        this.description = photo.getDescription();
        this.filePath = photo.getFilePath();
        this.thumbnailPath = photo.getThumbnailPath();
        this.takenAt = photo.getTakenAt();
        this.location = photo.getLocation();
        this.likesCount = photo.getLikesCount();
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public LocalDateTime getTakenAt() {
        return takenAt;
    }
    
    public void setTakenAt(LocalDateTime takenAt) {
        this.takenAt = takenAt;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public Long getLikesCount() {
        return likesCount;
    }
    
    public void setLikesCount(Long likesCount) {
        this.likesCount = likesCount;
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