import { apiClient } from './client';
import type {
  DataResultListGetEventDayResponseDto,
  DataResultGetEventDayResponseDto,
  CreateEventDayRequest,
  UpdateEventDayRequest,
  Result,
} from '@/types/api';

export const eventDaysApi = {
  async getByEventId(eventId: string) {
    return apiClient.get<DataResultListGetEventDayResponseDto>(`/api/event-days/event/${eventId}`);
  },

  async getById(id: string) {
    return apiClient.get<DataResultGetEventDayResponseDto>(`/api/event-days/${id}`);
  },

  async create(data: CreateEventDayRequest) {
    return apiClient.post<DataResultGetEventDayResponseDto>('/api/event-days', data);
  },

  async update(id: string, data: UpdateEventDayRequest) {
    return apiClient.put<DataResultGetEventDayResponseDto>(`/api/event-days/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/event-days/${id}`);
  },
};
