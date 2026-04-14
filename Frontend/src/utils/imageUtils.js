import fallbackImage from '../assets/recipehub.png';

export const resolveImageUrl = (url) => {
    if (!url) return fallbackImage;
    
    // If it's a full URL, return it
    if (url.startsWith('http')) return url;
    
    // Otherwise, assume it's a relative path from the backend
    return `http://localhost:8080/images/${url}`;
};

export const handleImageError = (e) => {
    e.target.src = fallbackImage;
    e.target.onerror = null; // Prevent infinite loop if fallback also fails
};
