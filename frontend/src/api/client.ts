import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/utils/env';
import { storage, STORAGE_KEYS } from '@/utils/storage';

export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Storage access error, proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Format error messages & handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const statusCode = error.response?.status || 500;
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        // FastAPI Pydantic validation error
        message = data.detail[0].msg;
      } else if (data.message) {
        message = data.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    if (statusCode === 401) {
      // Token expired or invalid, purge token from storage
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    const apiError: ApiError = {
      message,
      statusCode,
      details: error.response?.data,
    };

    return Promise.reject(apiError);
  },
);
