import Axios, { AxiosInstance } from 'axios'

// Main axios instance for API calls
const axios: AxiosInstance = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies
    withXSRFToken: true, // Handle CSRF tokens automatically
})

// Separate axios instance for CSRF cookie (no /api prefix)
export const csrfClient = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    },
})

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if not already there
            if (typeof window !== "undefined" && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axios