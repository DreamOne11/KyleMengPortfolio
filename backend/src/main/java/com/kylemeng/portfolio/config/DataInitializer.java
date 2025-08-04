package com.kylemeng.portfolio.config;

import com.kylemeng.portfolio.entity.Photo;
import com.kylemeng.portfolio.entity.PhotoCategory;
import com.kylemeng.portfolio.service.PhotoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    private final PhotoService photoService;
    
    @Autowired
    public DataInitializer(PhotoService photoService) {
        this.photoService = photoService;
    }
    
    @Override
    public void run(String... args) throws Exception {
        initializePhotoCategories();
        initializeSamplePhotos();
    }
    
    private void initializePhotoCategories() {
        logger.info("Initializing photo categories...");
        
        // Check if categories already exist
        List<PhotoCategory> existingCategories = photoService.getAllCategories();
        if (!existingCategories.isEmpty()) {
            logger.info("Photo categories already exist, skipping initialization");
            return;
        }
        
        // Create default photo categories
        PhotoCategory[] categories = {
            createCategory("portrait", "Portrait", 
                "Portrait photography capturing human essence and character", "#EC4899", 1),
            createCategory("landscape", "Landscape", 
                "Natural scenery and environmental landscape photography", "#10B981", 2),
            createCategory("humanist", "Humanist", 
                "Documentary photography showcasing human life and culture", "#3B82F6", 3)
        };
        
        for (PhotoCategory category : categories) {
            try {
                PhotoCategory saved = photoService.createCategory(category);
                logger.info("Created photo category: {} (ID: {})", saved.getDisplayName(), saved.getId());
            } catch (Exception e) {
                logger.error("Failed to create photo category: {}", category.getDisplayName(), e);
            }
        }
        
        logger.info("Photo categories initialization completed");
    }
    
    private void initializeSamplePhotos() {
        logger.info("Initializing sample photos...");
        
        List<PhotoCategory> categories = photoService.getAllCategories();
        if (categories.isEmpty()) {
            logger.warn("No photo categories found, skipping photo initialization");
            return;
        }
        
        // Create sample photos for each category
        for (PhotoCategory category : categories) {
            createSamplePhotosForCategory(category);
        }
        
        logger.info("Sample photos initialization completed");
    }
    
    private void createSamplePhotosForCategory(PhotoCategory category) {
        String categoryName = category.getName().toLowerCase();
        
        switch (categoryName) {
            case "portrait":
                createPhoto(category, "Portrait Study 1", 
                    "Professional portrait capturing natural expression", 
                    "/images/photography/portrait/DSC_4661.jpg",
                    "/images/photography/portrait/DSC_4661.jpg",
                    "Studio Session", 25L);
                
                createPhoto(category, "Portrait Study 2", 
                    "Character portrait with dramatic lighting", 
                    "/images/photography/portrait/DSC_4679.jpg",
                    "/images/photography/portrait/DSC_4679.jpg",
                    "Portrait Studio", 18L);
                
                createPhoto(category, "Portrait Study 3", 
                    "Environmental portrait in natural setting", 
                    "/images/photography/portrait/DSC_4769.jpg",
                    "/images/photography/portrait/DSC_4769.jpg",
                    "Outdoor Location", 32L);
                
                createPhoto(category, "Portrait Study 4", 
                    "Classic portrait with soft lighting", 
                    "/images/photography/portrait/DSC_4872.jpg",
                    "/images/photography/portrait/DSC_4872.jpg",
                    "Studio Session", 41L);
                
                createPhoto(category, "Portrait Study 5", 
                    "Contemporary portrait with modern aesthetic", 
                    "/images/photography/portrait/DSC_4873.jpg",
                    "/images/photography/portrait/DSC_4873.jpg",
                    "Portrait Studio", 29L);
                break;
                
            case "landscape":
                createPhoto(category, "Mountain Vista", 
                    "Breathtaking mountain landscape at golden hour", 
                    "/images/photography/landscape/DSC_1093.jpg",
                    "/images/photography/landscape/DSC_1093.jpg",
                    "Mountain Range", 67L);
                
                createPhoto(category, "Serene Waters", 
                    "Peaceful lake reflection with mountain backdrop", 
                    "/images/photography/landscape/DSC_1174.jpg",
                    "/images/photography/landscape/DSC_1174.jpg",
                    "Alpine Lake", 54L);
                
                createPhoto(category, "Natural Beauty", 
                    "Stunning natural landscape with dramatic sky", 
                    "/images/photography/landscape/DSC_1180.jpg",
                    "/images/photography/landscape/DSC_1180.jpg",
                    "Nature Reserve", 43L);
                
                createPhoto(category, "Wilderness Scene", 
                    "Untouched wilderness capturing nature's essence", 
                    "/images/photography/landscape/DSC_1190.jpg",
                    "/images/photography/landscape/DSC_1190.jpg",
                    "National Park", 38L);
                
                createPhoto(category, "Scenic Overlook", 
                    "Panoramic view from scenic mountain overlook", 
                    "/images/photography/landscape/DSC_1195.jpg",
                    "/images/photography/landscape/DSC_1195.jpg",
                    "Scenic Viewpoint", 52L);
                break;
                
            case "humanist":
                createPhoto(category, "Human Connection", 
                    "Authentic moment capturing human emotion", 
                    "/images/photography/humanist/DSC_3590.jpg",
                    "/images/photography/humanist/DSC_3590.jpg",
                    "Urban Setting", 73L);
                
                createPhoto(category, "Daily Life", 
                    "Candid documentation of everyday moments", 
                    "/images/photography/humanist/DSC_3592.jpg",
                    "/images/photography/humanist/DSC_3592.jpg",
                    "City Streets", 61L);
                
                createPhoto(category, "Cultural Expression", 
                    "Cultural moment showcasing human diversity", 
                    "/images/photography/humanist/DSC_3595.jpg",
                    "/images/photography/humanist/DSC_3595.jpg",
                    "Cultural District", 45L);
                
                createPhoto(category, "Social Documentary", 
                    "Documentary style capturing social interaction", 
                    "/images/photography/humanist/DSC_3597.jpg",
                    "/images/photography/humanist/DSC_3597.jpg",
                    "Public Space", 59L);
                
                createPhoto(category, "Life Stories", 
                    "Storytelling through humanistic photography", 
                    "/images/photography/humanist/DSC_3642.jpg",
                    "/images/photography/humanist/DSC_3642.jpg",
                    "Community Center", 48L);
                break;
                
            default:
                logger.warn("Unknown category: {}, skipping sample photos", categoryName);
        }
    }
    
    private PhotoCategory createCategory(String name, String displayName, String description, String iconColor, int sortOrder) {
        PhotoCategory category = new PhotoCategory();
        category.setName(name);
        category.setDisplayName(displayName);
        category.setDescription(description);
        category.setIconColor(iconColor);
        category.setSortOrder(sortOrder);
        return category;
    }
    
    private void createPhoto(PhotoCategory category, String title, String description, 
                           String filePath, String thumbnailPath, String location, Long likesCount) {
        try {
            Photo photo = new Photo();
            photo.setCategory(category);
            photo.setTitle(title);
            photo.setDescription(description);
            photo.setFilePath(filePath);
            photo.setThumbnailPath(thumbnailPath);
            photo.setLocation(location);
            photo.setLikesCount(likesCount);
            photo.setTakenAt(LocalDateTime.now().minusDays((long) (Math.random() * 365)));
            
            Photo saved = photoService.createPhoto(photo);
            logger.info("Created sample photo: {} for category: {} with {} likes", 
                       saved.getTitle(), category.getDisplayName(), likesCount);
        } catch (Exception e) {
            logger.error("Failed to create sample photo: {} for category: {}", title, category.getDisplayName(), e);
        }
    }
}