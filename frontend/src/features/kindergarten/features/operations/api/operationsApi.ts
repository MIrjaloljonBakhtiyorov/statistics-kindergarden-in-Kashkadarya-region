import { apiClient } from '@/shared/api';
import { Operation } from '../types/operation.types';

export const operationsApi = {
  getAll: async (): Promise<Operation[]> => {
    const res = await apiClient.get('/operations');
    return res.data;
  }
};

