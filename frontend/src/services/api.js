import axios from "axios";

// ✅ Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

// ✅ Debug (check in browser console)
console.log("API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= MEDICINE APIs ================= */

export const getMedicines = () => api.get("/medicines");
export const getLowStockMedicines = () => api.get("/medicines/low-stock");
export const getMedicine = (id) => api.get(`/medicines/${id}`);
export const createMedicine = (data) => api.post("/medicines", data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);

/* ================= BILL APIs ================= */

export const createBill = (data) => api.post("/bills", data);
export const getBills = () => api.get("/bills");
export const getBill = (id) => api.get(`/bills/${id}`);
export const deleteBill = (id) => api.delete(`/bills/${id}`);

export default api;