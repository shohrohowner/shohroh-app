import axios from 'axios';

// The base URL should be in a config file, but for simplicity, it's here.
const API_URL = 'http://192.168.18.94:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Function to attach the auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Station Endpoints ---
export const getStations = () => api.get('/stations');
export const addStation = (data: { name: string; lat: number; lng: number }) => api.post('/stations', data);
export const updateStation = (id: string, data: { name: string }) => api.put(`/stations/${id}`, data);
export const deleteStation = (id: string) => api.delete(`/stations/${id}`);

// --- Route Endpoints ---
export const getRoutes = () => api.get('/routes');
export const addRoute = (data: { name: string; color: string; stationIds: string[] }) => api.post('/routes', data);
export const updateRoute = (id: string, data: { name: string; color: string }) => api.put(`/routes/${id}`, data);
export const deleteRoute = (id: string) => api.delete(`/routes/${id}`);

// --- Admin Endpoints ---
export const loginAdmin = (data: {username: string, password: string}) => api.post('/admin/login', data);

export default api; 