package com.kylemeng.portfolio.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
public class Photo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Photo category is required")
    @JsonBackReference
    private PhotoCategory category;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Photo title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "file_path", nullable = false, length = 500)
    @NotBlank(message = "File path is required")
    @Size(max = 500, message = "File path must not exceed 500 characters")
    private String filePath;
    
    @Column(name = "thumbnail_path", length = 500)
    @Size(max = 500, message = "Thumbnail path must not exceed 500 characters")
    private String thumbnailPath;
    
    @Column(columnDefinition = "JSONB")
    private String metadata;
    
    @Column(name = "taken_at")
    private LocalDateTime takenAt;
    
    @Column(length = 200)
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;
    
    @Column(name = "camera_info", length = 200)
    @Size(max = 200, message = "Camera info must not exceed 200 characters")
    private String cameraInfo;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(length = 20)
    @Size(max = 20, message = "Dimensions must not exceed 20 characters")
    private String dimensions;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public Photo() {}
    
    // Constructor with required fields
    public Photo(String title, String filePath, PhotoCategory category) {
        this.title = title;
        this.filePath = filePath;
        this.category = category;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public PhotoCategory getCategory() {
        return category;
    }
    
    public void setCategory(PhotoCategory category) {
        this.category = category;
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
    
    @Override
    public String toString() {
        return "Photo{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", filePath='" + filePath + '\'' +
                ", location='" + location + '\'' +
                ", isFeatured=" + isFeatured +
                '}';
    }
}