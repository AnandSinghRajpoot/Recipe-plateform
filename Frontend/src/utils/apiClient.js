import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Should be in .env in production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      // Network error or timeout
      toast.error('Network failure. Please check your internet connection.');
      return Promise.reject(error);
    }

    const { status, data } = response;
    const message = data?.message || 'An unexpected error occurred';

    switch (status) {
      case 401:
        // Don't show "Session expired" for login attempts
        if (!error.config.url.includes('/auth/login')) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
        break;
      case 403:
        toast.error('Access denied: You do not have permission.');
        break;
      case 404:
        // Handled per-component usually, but can toast here too
        break;
      case 500:
        toast.error('Internal server error. Our team has been notified.');
        break;
      default:
        // Other errors handled by handleApiError in components
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
