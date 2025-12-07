package com.kylemeng.portfolio.config;

import com.kylemeng.portfolio.entity.Photo;
import com.kylemeng.portfolio.entity.PhotoCategory;
import com.kylemeng.portfolio.service.PhotoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

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

        // Check if photos already exist
        boolean photosExist = categories.stream()
            .anyMatch(category -> !photoService.getPhotosByCategoryId(category.getId()).isEmpty());

        if (photosExist) {
            logger.info("Sample photos already exist, skipping initialization");
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
                    "/photos/photography/portrait/thumbnails/DSC_4661-full.webp",
                    "/photos/photography/portrait/thumbnails/DSC_4661-card.webp");

                createPhoto(category, "Portrait Study 2",
                    "/photos/photography/portrait/thumbnails/DSC_4679-full.webp",
                    "/photos/photography/portrait/thumbnails/DSC_4679-card.webp");

                createPhoto(category, "Portrait Study 3",
                    "/photos/photography/portrait/thumbnails/DSC_4769-full.webp",
                    "/photos/photography/portrait/thumbnails/DSC_4769-card.webp");

                createPhoto(category, "Portrait Study 4",
                    "/photos/photography/portrait/thumbnails/DSC_4872-full.webp",
                    "/photos/photography/portrait/thumbnails/DSC_4872-card.webp");

                createPhoto(category, "Portrait Study 5",
                    "/photos/photography/portrait/thumbnails/DSC_4873-full.webp",
                    "/photos/photography/portrait/thumbnails/DSC_4873-card.webp");
                break;

            case "landscape":
                createPhoto(category, "Mountain Vista",
                    "/photos/photography/landscape/thumbnails/DSC_1093-full.webp",
                    "/photos/photography/landscape/thumbnails/DSC_1093-card.webp");

                createPhoto(category, "Serene Waters",
                    "/photos/photography/landscape/thumbnails/DSC_1174-full.webp",
                    "/photos/photography/landscape/thumbnails/DSC_1174-card.webp");

                createPhoto(category, "Natural Beauty",
                    "/photos/photography/landscape/thumbnails/DSC_1180-full.webp",
                    "/photos/photography/landscape/thumbnails/DSC_1180-card.webp");

                createPhoto(category, "Wilderness Scene",
                    "/photos/photography/landscape/thumbnails/DSC_1190-full.webp",
                    "/photos/photography/landscape/thumbnails/DSC_1190-card.webp");

                createPhoto(category, "Scenic Overlook",
                    "/photos/photography/landscape/thumbnails/DSC_1195-full.webp",
                    "/photos/photography/landscape/thumbnails/DSC_1195-card.webp");
                break;

            case "humanist":
                createPhoto(category, "Human Connection",
                    "/photos/photography/humanist/thumbnails/DSC_3590-full.webp",
                    "/photos/photography/humanist/thumbnails/DSC_3590-card.webp");

                createPhoto(category, "Daily Life",
                    "/photos/photography/humanist/thumbnails/DSC_3592-full.webp",
                    "/photos/photography/humanist/thumbnails/DSC_3592-card.webp");

                createPhoto(category, "Cultural Expression",
                    "/photos/photography/humanist/thumbnails/DSC_3595-full.webp",
                    "/photos/photography/humanist/thumbnails/DSC_3595-card.webp");

                createPhoto(category, "Social Documentary",
                    "/photos/photography/humanist/thumbnails/DSC_3597-full.webp",
                    "/photos/photography/humanist/thumbnails/DSC_3597-card.webp");

                createPhoto(category, "Life Stories",
                    "/photos/photography/humanist/thumbnails/DSC_3642-full.webp",
                    "/photos/photography/humanist/thumbnails/DSC_3642-card.webp");
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
    
    private void createPhoto(PhotoCategory category, String title,
                           String filePath, String thumbnailPath) {
        try {
            Photo photo = new Photo();
            photo.setCategory(category);
            photo.setTitle(title);
            photo.setFilePath(filePath);
            photo.setThumbnailPath(thumbnailPath);

            Photo saved = photoService.createPhoto(photo);
            logger.info("Created sample photo: {} for category: {}",
                       saved.getTitle(), category.getDisplayName());
        } catch (Exception e) {
            logger.error("Failed to create sample photo: {} for category: {}", title, category.getDisplayName(), e);
        }
    }
}