import { apiClient } from '@/shared/api';
import { Inspection } from '../types/inspector.types';

export const inspectorApi = {
  createInspection: (type: Inspection['type']) => 
    apiClient.post<Inspection>('/inspector', { type }),
    
  updateInspection: (id: string, data: Partial<Inspection>) => 
    apiClient.patch<Inspection>(`/inspector/${id}`, data),
    
  getInspections: () => 
    apiClient.get<Inspection[]>('/inspector'),
    
  submitInspection: (id: string) => 
    apiClient.post(`/inspector/${id}/submit`),
};

