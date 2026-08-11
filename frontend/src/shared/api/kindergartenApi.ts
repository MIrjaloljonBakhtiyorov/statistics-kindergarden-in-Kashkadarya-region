import apiClient from './apiClient';

export const kindergartenApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/kindergartens', { params }).then((res) => res.data),
  create: (data: any) => apiClient.post('/kindergartens', data).then((res) => res.data),
  update: (id: string, data: any) => apiClient.put(`/kindergartens/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/kindergartens/${id}`).then((res) => res.data),
  websites: {
    getAll: () => apiClient.get('/kindergartens/websites').then((res) => res.data),
    getByKindergarten: (kindergartenId: string) => apiClient.get(`/kindergartens/websites/${kindergartenId}`).then((res) => res.data),
    save: (kindergartenId: string, data: any) => apiClient.put(`/kindergartens/websites/${kindergartenId}`, data).then((res) => res.data),
  },
  websiteNews: {
    getAll: () => apiClient.get('/kindergartens/website-news').then((res) => res.data),
    getByKindergarten: (kindergartenId: string) => apiClient.get(`/kindergartens/websites/${kindergartenId}/news`).then((res) => res.data),
    create: (kindergartenId: string, data: any) => apiClient.post(`/kindergartens/websites/${kindergartenId}/news`, data).then((res) => res.data),
    update: (newsId: string, data: any) => apiClient.put(`/kindergartens/website-news/${newsId}`, data).then((res) => res.data),
    delete: (newsId: string) => apiClient.delete(`/kindergartens/website-news/${newsId}`).then((res) => res.data),
  },
  parentProfileNews: {
    getAll: () => apiClient.get('/kindergartens/parent-profile-news').then((res) => res.data),
    create: (data: any) => apiClient.post('/kindergartens/parent-profile-news', data).then((res) => res.data),
    update: (newsId: string, data: any) => apiClient.put(`/kindergartens/parent-profile-news/${newsId}`, data).then((res) => res.data),
    delete: (newsId: string) => apiClient.delete(`/kindergartens/parent-profile-news/${newsId}`).then((res) => res.data),
  },
};
