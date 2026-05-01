// API Test Utility for Photography Integration
import { PhotographyApiService } from '../services/photographyApi';

export const testPhotographyApi = async () => {
  console.log('🧪 Testing Photography API Integration...');
  
  try {
    // Test API health check
    const isHealthy = await PhotographyApiService.healthCheck();
    console.log('✅ API Health Check:', isHealthy ? 'PASS' : 'FAIL');
    
    if (isHealthy) {
      // Test getting photo categories
      const categories = await PhotographyApiService.getPhotoCategories();
      console.log('✅ Photo Categories:', categories.length, 'categories found');
      categories.forEach(cat => {
        console.log(`  - ${cat.displayName}: ${cat.photoCount} photos`);
      });
      
      // Test getting photos for first category if it exists
      if (categories.length > 0) {
        const firstCategory = categories[0];
        const photos = await PhotographyApiService.getPhotosByCategory(firstCategory.id);
        console.log(`✅ Photos in ${firstCategory.displayName}:`, photos.length, 'photos found');
        photos.forEach(photo => {
          console.log(`  - ${photo.title}: ${photo.filePath}`);
        });
      }
      
      // Test getting popular photos
      const popularPhotos = await PhotographyApiService.getPopularPhotos();
      console.log('✅ Popular Photos:', popularPhotos.length, 'popular photos found');
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return false;
  }
  
  return true;
};

// Auto-run test in development
if (import.meta.env.DEV) {
  // Only run in browser context, not during build
  if (typeof window !== 'undefined') {
    // Delay execution to allow other modules to load
    setTimeout(() => {
      testPhotographyApi();
    }, 2000);
  }
}
