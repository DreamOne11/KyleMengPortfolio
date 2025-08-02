package com.kylemeng.portfolio.service;

import com.kylemeng.portfolio.entity.Photo;
import com.kylemeng.portfolio.entity.PhotoCategory;
import com.kylemeng.portfolio.repository.PhotoCategoryRepository;
import com.kylemeng.portfolio.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PhotoService {
    
    private final PhotoRepository photoRepository;
    private final PhotoCategoryRepository photoCategoryRepository;
    
    @Autowired
    public PhotoService(PhotoRepository photoRepository, PhotoCategoryRepository photoCategoryRepository) {
        this.photoRepository = photoRepository;
        this.photoCategoryRepository = photoCategoryRepository;
    }
    
    // Photo Category operations
    
    /**
     * Get all photo categories
     */
    @Transactional(readOnly = true)
    public List<PhotoCategory> getAllCategories() {
        return photoCategoryRepository.findAllByOrderBySortOrderAscNameAsc();
    }
    
    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public Optional<PhotoCategory> getCategoryById(Long id) {
        return photoCategoryRepository.findById(id);
    }
    
    /**
     * Get category by name
     */
    @Transactional(readOnly = true)
    public Optional<PhotoCategory> getCategoryByName(String name) {
        return photoCategoryRepository.findByName(name);
    }
    
    /**
     * Create new photo category
     */
    public PhotoCategory createCategory(PhotoCategory category) {
        return photoCategoryRepository.save(category);
    }
    
    /**
     * Update existing category
     */
    public PhotoCategory updateCategory(PhotoCategory category) {
        return photoCategoryRepository.save(category);
    }
    
    /**
     * Delete category by ID
     */
    public void deleteCategory(Long id) {
        photoCategoryRepository.deleteById(id);
    }
    
    // Photo operations
    
    /**
     * Get all photos
     */
    @Transactional(readOnly = true)
    public List<Photo> getAllPhotos() {
        return photoRepository.findAll();
    }
    
    /**
     * Get photo by ID
     */
    @Transactional(readOnly = true)
    public Optional<Photo> getPhotoById(Long id) {
        return photoRepository.findById(id);
    }
    
    /**
     * Get photos by category ID
     */
    @Transactional(readOnly = true)
    public List<Photo> getPhotosByCategoryId(Long categoryId) {
        return photoRepository.findByCategoryIdOrderBySortOrderAscCreatedAtDesc(categoryId);
    }
    
    /**
     * Get photos by category with pagination
     */
    @Transactional(readOnly = true)
    public Page<Photo> getPhotosByCategoryId(Long categoryId, Pageable pageable) {
        return photoRepository.findByCategoryIdOrderBySortOrderAscCreatedAtDesc(categoryId, pageable);
    }
    
    /**
     * Get featured photos
     */
    @Transactional(readOnly = true)
    public List<Photo> getFeaturedPhotos() {
        return photoRepository.findByIsFeaturedTrueOrderBySortOrderAscCreatedAtDesc();
    }
    
    /**
     * Search photos by keyword
     */
    @Transactional(readOnly = true)
    public List<Photo> searchPhotos(String keyword) {
        return photoRepository.searchByKeyword(keyword);
    }
    
    /**
     * Search photos by keyword with pagination
     */
    @Transactional(readOnly = true)
    public Page<Photo> searchPhotos(String keyword, Pageable pageable) {
        return photoRepository.searchByKeyword(keyword, pageable);
    }
    
    /**
     * Create new photo
     */
    public Photo createPhoto(Photo photo) {
        return photoRepository.save(photo);
    }
    
    /**
     * Update existing photo
     */
    public Photo updatePhoto(Photo photo) {
        return photoRepository.save(photo);
    }
    
    /**
     * Delete photo by ID
     */
    public void deletePhoto(Long id) {
        photoRepository.deleteById(id);
    }
    
    /**
     * Count photos by category ID
     */
    @Transactional(readOnly = true)
    public long countPhotosByCategory(Long categoryId) {
        return photoRepository.countByCategoryId(categoryId);
    }
    
    /**
     * Get photos by location
     */
    @Transactional(readOnly = true)
    public List<Photo> getPhotosByLocation(String location) {
        return photoRepository.findByLocationContainingIgnoreCaseOrderByCreatedAtDesc(location);
    }
    
    /**
     * Get photos by camera info
     */
    @Transactional(readOnly = true)
    public List<Photo> getPhotosByCameraInfo(String cameraInfo) {
        return photoRepository.findByCameraInfoContainingIgnoreCaseOrderByCreatedAtDesc(cameraInfo);
    }
}