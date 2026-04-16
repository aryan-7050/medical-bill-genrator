import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
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

// Medicine APIs
export const getMedicines = () => api.get('/medicines');
export const getLowStockMedicines = () => api.get('/medicines/low-stock');
export const getMedicine = (id) => api.get(`/medicines/${id}`);
export const createMedicine = (data) => api.post('/medicines', data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);

// Bill APIs
export const createBill = (data) => api.post('/bills', data);
export const getBills = () => api.get('/bills');
export const getBill = (id) => api.get(`/bills/${id}`);
export const deleteBill = (id) => api.delete(`/bills/${id}`); // New delete function

export default api;