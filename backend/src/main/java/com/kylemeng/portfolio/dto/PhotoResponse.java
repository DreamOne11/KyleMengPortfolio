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
    private String metadata;
    private LocalDateTime takenAt;
    private String location;
    private String cameraInfo;
    private Long fileSize;
    private String dimensions;
    private Integer sortOrder;
    private Boolean isFeatured;
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
        this.metadata = photo.getMetadata();
        this.takenAt = photo.getTakenAt();
        this.location = photo.getLocation();
        this.cameraInfo = photo.getCameraInfo();
        this.fileSize = photo.getFileSize();
        this.dimensions = photo.getDimensions();
        this.sortOrder = photo.getSortOrder();
        this.isFeatured = photo.getIsFeatured();
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
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
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
    
    public String getCameraInfo() {
        return cameraInfo;
    }
    
    public void setCameraInfo(String cameraInfo) {
        this.cameraInfo = cameraInfo;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getDimensions() {
        return dimensions;
    }
    
    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public Boolean getIsFeatured() {
        return isFeatured;
    }
    
    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
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