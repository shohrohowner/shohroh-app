import axios from 'axios';
import { Station, Route } from './types';
import config from './config';

const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment ? config.api.development : config.api.production;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.error || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.request);
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// Function to attach the auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Load token from localStorage on startup
const savedToken = localStorage.getItem('authToken');
if (savedToken) {
  setAuthToken(savedToken);
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handler for API calls
const handleApiError = (error: any): never => {
  console.error('API Error Details:', error.response?.data || error);
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An unexpected error occurred';
    throw new ApiError(status, message, error.response?.data);
  }
  throw new ApiError(500, 'An unexpected error occurred');
};

// Auth types
interface LoginResponse {
  token: string;
}

// --- Auth Endpoints ---
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('Attempting login with:', { username });
    const response = await api.post<LoginResponse>('/admin/login', { username, password });
    console.log('Login response:', response.data);
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    return handleApiError(error);
  }
};

export const logout = (): void => {
  setAuthToken(null);
};

// --- Station APIs ---
export const getStations = async (): Promise<Station[]> => {
  try {
    const response = await api.get('/stations');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const addStation = async (station: Omit<Station, 'id'>): Promise<Station> => {
  try {
    const response = await api.post('/stations', station);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateStation = async (id: string, station: Partial<Station>): Promise<Station> => {
  try {
    const response = await api.put(`/stations/${id}`, station);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteStation = async (id: string): Promise<void> => {
  try {
    await api.delete(`/stations/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
};

// --- Route APIs ---
export const getRoutes = async (): Promise<Route[]> => {
  try {
    const response = await api.get('/routes');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const addRoute = async (route: Omit<Route, 'id'>): Promise<Route> => {
  try {
    const response = await api.post('/routes', route);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateRoute = async (id: string, route: Partial<Route>): Promise<Route> => {
  try {
    const response = await api.put(`/routes/${id}`, route);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteRoute = async (id: string): Promise<void> => {
  try {
    await api.delete(`/routes/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
};

export default api; 