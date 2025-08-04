package com.kylemeng.portfolio.controller;

import com.kylemeng.portfolio.dto.PhotoCategoryResponse;
import com.kylemeng.portfolio.dto.PhotoResponse;
import com.kylemeng.portfolio.entity.Photo;
import com.kylemeng.portfolio.entity.PhotoCategory;
import com.kylemeng.portfolio.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PhotoController {
    
    private final PhotoService photoService;
    
    @Autowired
    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }
    
    /**
     * GET /api/photo-categories
     * Get all photo categories with photo counts
     */
    @GetMapping("/photo-categories")
    public ResponseEntity<List<PhotoCategoryResponse>> getAllPhotoCategories() {
        try {
            List<PhotoCategory> categories = photoService.getAllCategories();
            List<PhotoCategoryResponse> response = categories.stream()
                    .map(category -> {
                        long photoCount = photoService.countPhotosByCategory(category.getId());
                        return new PhotoCategoryResponse(category, photoCount);
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photo-categories/{id}
     * Get specific photo category by ID
     */
    @GetMapping("/photo-categories/{id}")
    public ResponseEntity<PhotoCategoryResponse> getPhotoCategoryById(@PathVariable Long id) {
        try {
            Optional<PhotoCategory> category = photoService.getCategoryById(id);
            if (category.isPresent()) {
                long photoCount = photoService.countPhotosByCategory(id);
                return ResponseEntity.ok(new PhotoCategoryResponse(category.get(), photoCount));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photos/category/{categoryId}
     * Get photos by category ID with optional pagination
     */
    @GetMapping("/photos/category/{categoryId}")
    public ResponseEntity<List<PhotoResponse>> getPhotosByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<Photo> photos;
            
            if (page >= 0 && size > 0) {
                // Use pagination
                Pageable pageable = PageRequest.of(page, size);
                Page<Photo> photoPage = photoService.getPhotosByCategoryId(categoryId, pageable);
                photos = photoPage.getContent();
            } else {
                // Get all photos
                photos = photoService.getPhotosByCategoryId(categoryId);
            }
            
            List<PhotoResponse> response = photos.stream()
                    .map(PhotoResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photos/{id}
     * Get specific photo by ID
     */
    @GetMapping("/photos/{id}")
    public ResponseEntity<PhotoResponse> getPhotoById(@PathVariable Long id) {
        try {
            Optional<Photo> photo = photoService.getPhotoById(id);
            if (photo.isPresent()) {
                return ResponseEntity.ok(new PhotoResponse(photo.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photos/popular
     * Get photos ordered by likes count
     */
    @GetMapping("/photos/popular")
    public ResponseEntity<List<PhotoResponse>> getPopularPhotos() {
        try {
            List<Photo> photos = photoService.getPhotosByLikes();
            List<PhotoResponse> response = photos.stream()
                    .map(PhotoResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photos/top
     * Get top photos by likes count
     */
    @GetMapping("/photos/top")
    public ResponseEntity<List<PhotoResponse>> getTopPhotos() {
        try {
            List<Photo> photos = photoService.getTopPhotosByLikes();
            List<PhotoResponse> response = photos.stream()
                    .map(PhotoResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * POST /api/photos/{id}/like
     * Increment likes count for a photo
     */
    @PostMapping("/photos/{id}/like")
    public ResponseEntity<PhotoResponse> likePhoto(@PathVariable Long id) {
        try {
            Photo photo = photoService.incrementLikes(id);
            return ResponseEntity.ok(new PhotoResponse(photo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * POST /api/photos/{id}/unlike
     * Decrement likes count for a photo
     */
    @PostMapping("/photos/{id}/unlike")
    public ResponseEntity<PhotoResponse> unlikePhoto(@PathVariable Long id) {
        try {
            Photo photo = photoService.decrementLikes(id);
            return ResponseEntity.ok(new PhotoResponse(photo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photos/category/{categoryId}/popular
     * Get photos by category ordered by likes count
     */
    @GetMapping("/photos/category/{categoryId}/popular")
    public ResponseEntity<List<PhotoResponse>> getPopularPhotosByCategory(@PathVariable Long categoryId) {
        try {
            List<Photo> photos = photoService.getPhotosByCategoryOrderByLikes(categoryId);
            List<PhotoResponse> response = photos.stream()
                    .map(PhotoResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photos/search
     * Search photos by keyword
     */
    @GetMapping("/photos/search")
    public ResponseEntity<List<PhotoResponse>> searchPhotos(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<Photo> photos;
            
            if (page >= 0 && size > 0) {
                // Use pagination
                Pageable pageable = PageRequest.of(page, size);
                Page<Photo> photoPage = photoService.searchPhotos(keyword, pageable);
                photos = photoPage.getContent();
            } else {
                // Get all search results
                photos = photoService.searchPhotos(keyword);
            }
            
            List<PhotoResponse> response = photos.stream()
                    .map(PhotoResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/photos
     * Get all photos with optional pagination
     */
    @GetMapping("/photos")
    public ResponseEntity<List<PhotoResponse>> getAllPhotos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<Photo> photos = photoService.getAllPhotos();
            List<PhotoResponse> response = photos.stream()
                    .map(PhotoResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}