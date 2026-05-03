import { apiClient } from './client';
import type {
  DataResultListGetTicketResponseDto,
  DataResultGetTicketResponseDto,
  Result,
} from '@/types/api';

export const ticketsApi = {
  async getAll(params?: { email?: string; userId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.email) searchParams.append('email', params.email);
    if (params?.userId) searchParams.append('userId', params.userId);
    const qs = searchParams.toString();
    return apiClient.get<DataResultListGetTicketResponseDto>(`/api/tickets${qs ? `?${qs}` : ''}`);
  },

  async getById(ticketId: string) {
    return apiClient.get<DataResultGetTicketResponseDto>(`/api/tickets/${ticketId}`);
  },

  async getByEvent(eventId: string, q?: string) {
    const searchParams = new URLSearchParams();
    if (q) searchParams.append('q', q);
    const qs = searchParams.toString();
    return apiClient.get<DataResultListGetTicketResponseDto>(
      `/api/events/${eventId}/tickets${qs ? `?${qs}` : ''}`,
    );
  },

  async checkIn(ticketId: string, eventDayId: string) {
    return apiClient.post<Result>(`/api/tickets/${ticketId}/event-days/${eventDayId}/check-in`);
  },
};
