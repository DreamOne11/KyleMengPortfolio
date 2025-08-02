package com.kylemeng.portfolio.dto;

import com.kylemeng.portfolio.entity.PhotoCategory;

import java.time.LocalDateTime;

public class PhotoCategoryResponse {
    
    private Long id;
    private String name;
    private String displayName;
    private String description;
    private String iconColor;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long photoCount;
    
    // Default constructor
    public PhotoCategoryResponse() {}
    
    // Constructor from entity
    public PhotoCategoryResponse(PhotoCategory category) {
        this.id = category.getId();
        this.name = category.getName();
        this.displayName = category.getDisplayName();
        this.description = category.getDescription();
        this.iconColor = category.getIconColor();
        this.sortOrder = category.getSortOrder();
        this.createdAt = category.getCreatedAt();
        this.updatedAt = category.getUpdatedAt();
        this.photoCount = category.getPhotoCount();
    }
    
    // Constructor with photo count
    public PhotoCategoryResponse(PhotoCategory category, long photoCount) {
        this(category);
        this.photoCount = photoCount;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIconColor() {
        return iconColor;
    }
    
    public void setIconColor(String iconColor) {
        this.iconColor = iconColor;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
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
    
    public long getPhotoCount() {
        return photoCount;
    }
    
    public void setPhotoCount(long photoCount) {
        this.photoCount = photoCount;
    }
}