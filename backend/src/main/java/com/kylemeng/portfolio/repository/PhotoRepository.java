package com.kylemeng.portfolio.repository;

import com.kylemeng.portfolio.entity.Photo;
import com.kylemeng.portfolio.entity.PhotoCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    
    /**
     * Find photos by category ordered by sort order and creation date
     */
    List<Photo> findByCategoryOrderBySortOrderAscCreatedAtDesc(PhotoCategory category);
    
    /**
     * Find photos by category ID ordered by sort order and creation date
     */
    List<Photo> findByCategoryIdOrderBySortOrderAscCreatedAtDesc(Long categoryId);
    
    /**
     * Find photos by category with pagination
     */
    Page<Photo> findByCategoryOrderBySortOrderAscCreatedAtDesc(PhotoCategory category, Pageable pageable);
    
    /**
     * Find photos by category ID with pagination
     */
    Page<Photo> findByCategoryIdOrderBySortOrderAscCreatedAtDesc(Long categoryId, Pageable pageable);
    
    /**
     * Find featured photos
     */
    List<Photo> findByIsFeaturedTrueOrderBySortOrderAscCreatedAtDesc();
    
    /**
     * Find featured photos by category
     */
    List<Photo> findByCategoryAndIsFeaturedTrueOrderBySortOrderAscCreatedAtDesc(PhotoCategory category);
    
    /**
     * Find photos by location
     */
    List<Photo> findByLocationContainingIgnoreCaseOrderByCreatedAtDesc(String location);
    
    /**
     * Count photos by category
     */
    long countByCategory(PhotoCategory category);
    
    /**
     * Count photos by category ID
     */
    long countByCategoryId(Long categoryId);
    
    /**
     * Search photos by title or description
     */
    @Query("SELECT p FROM Photo p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY p.sortOrder ASC, p.createdAt DESC")
    List<Photo> searchByKeyword(@Param("keyword") String keyword);
    
    /**
     * Search photos by title or description with pagination
     */
    @Query("SELECT p FROM Photo p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY p.sortOrder ASC, p.createdAt DESC")
    Page<Photo> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Find photos by camera info
     */
    List<Photo> findByCameraInfoContainingIgnoreCaseOrderByCreatedAtDesc(String cameraInfo);
}