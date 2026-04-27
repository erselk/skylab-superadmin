import { apiClient } from './client';
import type { DataResultMediaDto } from '@/types/api';

export const mediaApi = {
  async getById(id: string) {
    return apiClient.get<DataResultMediaDto>(`/api/media/${id}`);
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<DataResultMediaDto>('/api/media', formData);
  },
};
