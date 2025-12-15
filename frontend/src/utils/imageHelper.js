// Helper function to get image URL
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/src/assets/meal1.jpg'
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }
    
    // If it starts with /, return as is (for assets in public folder)
    if (imagePath.startsWith('/')) {
        return imagePath
    }
    
    // Otherwise, assume it's a relative path from assets
    return imagePath.startsWith('/src/assets') ? imagePath : `/src/assets${imagePath}`
}
