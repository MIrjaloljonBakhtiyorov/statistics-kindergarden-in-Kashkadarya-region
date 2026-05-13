import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const kindergartenApi = {
  getAll: () => apiClient.get('/kindergartens').then(res => res.data),
  create: (data: any) => apiClient.post('/kindergartens', data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/kindergartens/${id}`).then(res => res.data),
};

export default apiClient;
