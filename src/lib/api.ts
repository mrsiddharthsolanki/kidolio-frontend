import axios from 'axios';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://kidolio.onrender.com';
console.log('Kidolio API base URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kidolio-token');
  if (token && config.headers) {
    // Use type guard for AxiosHeaders (Axios v1.2+) or plain object
    if (typeof (config.headers as { set?: unknown }).set === 'function') {
      (config.headers as { set: (k: string, v: string) => void }).set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('kidolio-token');
      // Do NOT redirect to /login or /signin here; let the UI handle it
    }
    return Promise.reject(error);
  }
);

export type ApiError = {
  message: string;
  code: string;
  status: number;
};

export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

export default api;
