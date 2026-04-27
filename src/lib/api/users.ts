import { apiClient } from './client';
import type {
  DataResultListUserDto,
  DataResultUserDto,
  UpdateUserRequest,
  PromoteUserRequest,
  Result,
} from '@/types/api';

export const usersApi = {
  async getAll(params?: { email?: string; roles?: string[] }) {
    const query = new URLSearchParams();
    if (params?.email) query.set('email', params.email);
    if (params?.roles) {
      params.roles.forEach((role) => query.append('roles', role));
    }
    const qs = query.toString();
    return apiClient.get<DataResultListUserDto>(qs ? `/api/users?${qs}` : '/api/users');
  },

  async getById(id: string) {
    return apiClient.get<DataResultUserDto>(`/api/users/${id}`);
  },

  async getMe() {
    return apiClient.get<DataResultUserDto>('/api/users/me');
  },

  async updateMe(data: UpdateUserRequest) {
    return apiClient.patch<DataResultUserDto>('/api/users/me', data);
  },

  async update(id: string, data: UpdateUserRequest) {
    return apiClient.patch<DataResultUserDto>(`/api/users/${id}`, data);
  },

  async promote(id: string, data: PromoteUserRequest) {
    return apiClient.post<Result>(`/api/users/${id}/promote`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/users/${id}`);
  },

  async updateProfilePicture(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return apiClient.postFormData<Result>('/api/users/me/profile-picture', formData);
  },
};
