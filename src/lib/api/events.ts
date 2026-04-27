import { apiClient } from './client';
import type {
  DataResultListEventDto,
  DataResultEventDto,
  CreateEventRequest,
  UpdateEventRequest,
  Result,
} from '@/types/api';

export const eventsApi = {
  async getAll() {
    return apiClient.get<DataResultListEventDto>('/api/events');
  },

  async getActive() {
    return apiClient.get<DataResultListEventDto>('/api/events/active');
  },

  async getByEventType(eventTypeName: string) {
    return apiClient.get<any>(`/api/events/type/${encodeURIComponent(eventTypeName)}`);
  },

  async getById(id: string) {
    return apiClient.get<DataResultEventDto>(`/api/events/${id}`);
  },

  async create(data: CreateEventRequest, coverImage: File) {
    const formData = new FormData();
    formData.append('coverImage', coverImage);
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    return apiClient.postFormData<DataResultEventDto>('/api/events', formData);
  },

  async update(id: string, data: UpdateEventRequest) {
    // Backend docs specify UpdateEventRequest JSON body for PUT
    return apiClient.put<DataResultEventDto>(`/api/events/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/events/${id}`);
  },

  async assignSeason(eventId: string, seasonId: string) {
    return apiClient.post<DataResultEventDto>(`/api/events/${eventId}/seasons/${seasonId}`);
  },

  async removeSeason(eventId: string) {
    return apiClient.delete<Result>(`/api/events/${eventId}/season`);
  },

  async getCompetitors(eventId: string) {
    return apiClient.get<any>(`/api/events/${eventId}/competitors`);
  },

  async getWinner(eventId: string) {
    return apiClient.get<any>(`/api/events/${eventId}/competitors/winner`);
  },
};
