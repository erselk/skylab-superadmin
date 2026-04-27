import { apiClient } from './client';
import type { DataResultUserDto } from '@/types/api';

export const internalUsersApi = {
  async getById(id: string) {
    return apiClient.get<DataResultUserDto>(`/internal/api/users/${id}`);
  },

  async getAuthenticatedUser() {
    return apiClient.get<DataResultUserDto>('/internal/api/users/authenticated-user');
  },

  async getByIds(userIds: string[]) {
    return apiClient.post<any>('/internal/api/users/batch', userIds);
  },
};
