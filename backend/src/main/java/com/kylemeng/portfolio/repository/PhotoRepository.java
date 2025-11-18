package com.kylemeng.portfolio.repository;

import com.kylemeng.portfolio.entity.Photo;
import com.kylemeng.portfolio.entity.PhotoCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    
    /**
     * Find photos by category ordered by creation date
     */
    List<Photo> findByCategoryOrderByCreatedAtDesc(PhotoCategory category);
    
    /**
     * Find photos by category ID ordered by creation date
     */
    List<Photo> findByCategoryIdOrderByCreatedAtDesc(Long categoryId);
    
    /**
     * Find photos by category with pagination
     */
    Page<Photo> findByCategoryOrderByCreatedAtDesc(PhotoCategory category, Pageable pageable);
    
    /**
     * Find photos by category ID with pagination
     */
    Page<Photo> findByCategoryIdOrderByCreatedAtDesc(Long categoryId, Pageable pageable);

    /**
     * Count photos by category
     */
    long countByCategory(PhotoCategory category);
    
    /**
     * Count photos by category ID
     */
    long countByCategoryId(Long categoryId);
}