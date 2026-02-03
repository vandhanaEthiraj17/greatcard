import axios from 'axios';

// Base URL for API requests
// Using localhost:5001 as per configuration requirements
// In production, this would likely come from import.meta.env.VITE_API_URL
export const BASE_URL = 'http://localhost:5001';

// Create flexible axios instance
export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptors for response error handling if needed
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Standardize error reporting
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
