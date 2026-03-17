import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ikad_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ikad_token');
      localStorage.removeItem('ikad_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

export const productApi = {
  getAll: (params?: object) => api.get('/products', { params }),
  getOne: (id: number) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: number, data: FormData) => api.post(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const stockApi = {
  getHistory: (params?: object) => api.get('/stock/history', { params }),
  update: (id: number, data: object) => api.put(`/stock/${id}`, data),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const reportApi = {
  getStock: () => api.get('/reports/stock'),
  exportPdf: () => api.get('/reports/stock/pdf', { responseType: 'blob' }),
  getHistory: (params?: object) => api.get('/reports/history', { params }),
};

export default api;
