import Axios, { AxiosInstance, AxiosResponse } from 'axios'

const axios: AxiosInstance = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
})

// Add Bearer token to requests automatically
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Added Bearer token to request:', config.url);
    } else {
        console.log('No Bearer token found for request:', config.url);
    }
    
    return config;
});
// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('auth_token');
            // Redirect to login if not already there
            if (typeof window !== "undefined" && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axios