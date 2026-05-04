import { apiClient } from './client';
import type {
  DataResultListCompetitorDto,
  DataResultCompetitorDto,
  CreateCompetitorRequest,
  UpdateCompetitorRequest,
  Result,
} from '@/types/api';

export const competitorsApi = {
  async getAll() {
    return apiClient.get<DataResultListCompetitorDto>('/api/competitors');
  },

  async getById(id: string) {
    return apiClient.get<DataResultCompetitorDto>(`/api/competitors/${id}`);
  },

  async create(data: CreateCompetitorRequest) {
    return apiClient.post<DataResultCompetitorDto>('/api/competitors', data);
  },

  async update(id: string, data: UpdateCompetitorRequest) {
    return apiClient.put<DataResultCompetitorDto>(`/api/competitors/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/competitors/${id}`);
  },

  async getMy() {
    return apiClient.get<DataResultListCompetitorDto>('/api/competitors/my');
  },

  // NOTE: Bu iki endpoint Postman koleksiyonunda yok.
  // Yanlis endpoint'e istek gitmesini engellemek icin bilincli olarak hata firlatiyoruz.
  async getByUserId(_userId: string, _params?: { includeUser?: boolean; includeEvent?: boolean }) {
    throw new Error('getByUserId endpointi API sozlesmesinde tanimli degil');
  },

  async getByEventId(
    _eventId: string,
    _params?: { includeUser?: boolean; includeEvent?: boolean },
  ) {
    throw new Error('getByEventId endpointi API sozlesmesinde tanimli degil');
  },

  async getEventWinner(eventId: string) {
    return apiClient.get<DataResultCompetitorDto>(`/api/events/${eventId}/competitors/winner`);
  },
};
