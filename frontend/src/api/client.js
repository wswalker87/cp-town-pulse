import axios from 'axios';

// Create an instance of axios
export const api = axios.create({
    // add backend IP
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to automatically add the token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token)
    {
        // Djoser/Django Token Auth 
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor to handle global errors (like 401 Unauth)
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401)
        {
            // If the token is invalid or expired, clean up
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);