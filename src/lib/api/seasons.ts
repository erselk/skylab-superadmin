import { apiClient } from './client';
import type {
  DataResultListSeasonDto,
  DataResultSeasonDto,
  CreateSeasonRequest,
  UpdateSeasonRequest,
  Result,
} from '@/types/api';

export const seasonsApi = {
  async getAll() {
    return apiClient.get<DataResultListSeasonDto>('/api/seasons');
  },

  async getActive() {
    return apiClient.get<DataResultListSeasonDto>('/api/seasons/active');
  },

  async getById(id: string) {
    return apiClient.get<DataResultSeasonDto>(`/api/seasons/${id}`);
  },

  async create(data: CreateSeasonRequest) {
    return apiClient.post<DataResultSeasonDto>('/api/seasons', data);
  },

  async update(id: string, data: UpdateSeasonRequest) {
    return apiClient.put<DataResultSeasonDto>(`/api/seasons/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/seasons/${id}`);
  },

  async addEvent(seasonId: string, eventId: string) {
    return apiClient.post<Result>(`/api/events/${eventId}/seasons/${seasonId}`);
  },

  async removeEvent(seasonId: string, eventId: string) {
    return apiClient.delete<Result>(`/api/events/${eventId}/season`);
  },
};
