import apiClient from './apiClient';

export const kindergartenApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/kindergartens', { params }).then((res) => res.data),
  create: (data: any) => apiClient.post('/kindergartens', data).then((res) => res.data),
  update: (id: string, data: any) => apiClient.put(`/kindergartens/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/kindergartens/${id}`).then((res) => res.data),
};
