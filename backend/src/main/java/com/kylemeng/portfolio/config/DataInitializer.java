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
            createCategory("nature", "Nature Photography", 
                "Beautiful landscapes, wildlife, and natural scenes", "#10B981", 1),
            createCategory("street", "Street Photography", 
                "Urban life, people, and candid moments", "#6B7280", 2),
            createCategory("portrait", "Portrait Photography", 
                "People portraits and character studies", "#EC4899", 3),
            createCategory("travel", "Travel Photography", 
                "Adventures and places around the world", "#3B82F6", 4)
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
            case "nature":
                createPhoto(category, "Mountain Sunrise", 
                    "Golden hour over the mountain peaks", 
                    "/images/photography/nature/mountain-sunrise.jpg",
                    "/images/photography/nature/thumbs/mountain-sunrise-thumb.jpg",
                    "Rocky Mountains, Colorado", "Canon EOS R5", true, 1);
                
                createPhoto(category, "Forest Stream", 
                    "Peaceful stream flowing through autumn forest", 
                    "/images/photography/nature/forest-stream.jpg",
                    "/images/photography/nature/thumbs/forest-stream-thumb.jpg",
                    "Pacific Northwest", "Nikon D850", false, 2);
                break;
                
            case "street":
                createPhoto(category, "City Rush", 
                    "People rushing through the busy intersection", 
                    "/images/photography/street/city-rush.jpg",
                    "/images/photography/street/thumbs/city-rush-thumb.jpg",
                    "New York City", "Fujifilm X-T4", true, 1);
                
                createPhoto(category, "Coffee Shop Moments", 
                    "Candid scene from a local coffee shop", 
                    "/images/photography/street/coffee-shop.jpg",
                    "/images/photography/street/thumbs/coffee-shop-thumb.jpg",
                    "San Francisco", "Leica Q2", false, 2);
                break;
                
            case "portrait":
                createPhoto(category, "Artist at Work", 
                    "Portrait of a painter in her studio", 
                    "/images/photography/portrait/artist-work.jpg",
                    "/images/photography/portrait/thumbs/artist-work-thumb.jpg",
                    "Studio, Brooklyn", "Canon 5D Mark IV", true, 1);
                
                createPhoto(category, "Young Entrepreneur", 
                    "Professional headshot for business profile", 
                    "/images/photography/portrait/entrepreneur.jpg",
                    "/images/photography/portrait/thumbs/entrepreneur-thumb.jpg",
                    "Silicon Valley", "Sony A7R IV", false, 2);
                break;
                
            case "travel":
                createPhoto(category, "Ancient Temple", 
                    "Sunrise over ancient temple complex", 
                    "/images/photography/travel/ancient-temple.jpg",
                    "/images/photography/travel/thumbs/ancient-temple-thumb.jpg",
                    "Angkor Wat, Cambodia", "Canon EOS R6", true, 1);
                
                createPhoto(category, "Market Vendors", 
                    "Colorful spices at traditional market", 
                    "/images/photography/travel/market-vendors.jpg",
                    "/images/photography/travel/thumbs/market-vendors-thumb.jpg",
                    "Marrakech, Morocco", "Fujifilm X-Pro3", false, 2);
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
                           String filePath, String thumbnailPath, String location, 
                           String cameraInfo, boolean isFeatured, int sortOrder) {
        try {
            Photo photo = new Photo();
            photo.setCategory(category);
            photo.setTitle(title);
            photo.setDescription(description);
            photo.setFilePath(filePath);
            photo.setThumbnailPath(thumbnailPath);
            photo.setLocation(location);
            photo.setCameraInfo(cameraInfo);
            photo.setIsFeatured(isFeatured);
            photo.setSortOrder(sortOrder);
            photo.setTakenAt(LocalDateTime.now().minusDays((long) (Math.random() * 365)));
            photo.setDimensions("1920x1080");
            photo.setFileSize((long) (Math.random() * 5000000 + 1000000)); // Random size between 1MB-6MB
            
            // Sample metadata as JSON
            photo.setMetadata("{\"aperture\":\"f/2.8\",\"shutterSpeed\":\"1/125\",\"iso\":800,\"focalLength\":\"85mm\"}");
            
            Photo saved = photoService.createPhoto(photo);
            logger.info("Created sample photo: {} for category: {}", saved.getTitle(), category.getDisplayName());
        } catch (Exception e) {
            logger.error("Failed to create sample photo: {} for category: {}", title, category.getDisplayName(), e);
        }
    }
}