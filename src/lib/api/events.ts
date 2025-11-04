import { apiClient } from './client';
import type {
  DataResultListEventDto,
  DataResultEventDto,
  CreateEventRequest,
} from '@/types/api';

export const eventsApi = {
  async getAll(params?: {
    includeEventType?: boolean;
    includeSession?: boolean;
    includeCompetitors?: boolean;
    includeImages?: boolean;
    includeSeason?: boolean;
    includeCompetition?: boolean;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultListEventDto>(`/api/events/${qs ? `?${qs}` : ''}`);
  },

  async getActive(params?: {
    includeEventType?: boolean;
    includeSession?: boolean;
    includeCompetitors?: boolean;
    includeImages?: boolean;
    includeSeason?: boolean;
    includeCompetition?: boolean;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultListEventDto>(`/api/events/active${qs ? `?${qs}` : ''}`);
  },

  async getByEventType(eventTypeName: string, params?: {
    includeEventType?: boolean;
    includeSession?: boolean;
    includeCompetitors?: boolean;
    includeImages?: boolean;
    includeSeason?: boolean;
    includeCompetition?: boolean;
  }) {
    const query = new URLSearchParams();
    query.set('eventTypeName', eventTypeName);
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    return apiClient.get(`/api/events/event-type?${query.toString()}`);
  },

  async getById(id: string, params?: {
    includeEventType?: boolean;
    includeSession?: boolean;
    includeCompetitors?: boolean;
    includeImages?: boolean;
    includeSeason?: boolean;
    includeCompetition?: boolean;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultEventDto>(`/api/events/${id}${qs ? `?${qs}` : ''}`);
  },

  async create(coverImage: File, data: CreateEventRequest) {
    const formData = new FormData();
    formData.append('coverImage', coverImage);
    formData.append('data', JSON.stringify(data));
    return apiClient.postFormData<DataResultEventDto>('/api/events/', formData);
  },
};

