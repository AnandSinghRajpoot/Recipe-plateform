export const resolveImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2000&auto=format&fit=crop";
    
    // If it's a full URL, return it
    if (url.startsWith('http')) return url;
    
    // Otherwise, assume it's a relative path from the backend
    return `http://localhost:8080/images/${url}`;
};
