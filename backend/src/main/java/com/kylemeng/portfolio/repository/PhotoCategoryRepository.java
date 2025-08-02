package com.kylemeng.portfolio.repository;

import com.kylemeng.portfolio.entity.PhotoCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoCategoryRepository extends JpaRepository<PhotoCategory, Long> {
    
    /**
     * Find all categories ordered by sort order and then by name
     */
    List<PhotoCategory> findAllByOrderBySortOrderAscNameAsc();
    
    /**
     * Find category by name
     */
    Optional<PhotoCategory> findByName(String name);
    
    /**
     * Find category by display name
     */
    Optional<PhotoCategory> findByDisplayName(String displayName);
    
    /**
     * Check if category exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Get categories with photo count
     */
    @Query("SELECT pc FROM PhotoCategory pc LEFT JOIN FETCH pc.photos")
    List<PhotoCategory> findAllWithPhotos();
    
    /**
     * Get categories with photo counts using custom query
     */
    @Query("SELECT pc.id, pc.name, pc.displayName, pc.description, pc.iconColor, " +
           "pc.sortOrder, pc.createdAt, pc.updatedAt, COUNT(p.id) as photoCount " +
           "FROM PhotoCategory pc LEFT JOIN pc.photos p " +
           "GROUP BY pc.id, pc.name, pc.displayName, pc.description, pc.iconColor, " +
           "pc.sortOrder, pc.createdAt, pc.updatedAt " +
           "ORDER BY pc.sortOrder ASC, pc.name ASC")
    List<Object[]> findAllWithPhotoCount();
}