import { apiClient } from './client';
import type {
  DataResultListSessionDto,
  DataResultSessionDto,
  CreateSessionRequest,
  DataResultVoid,
} from '@/types/api';

const ALLOWED_SESSION_TYPES = [
  'WORKSHOP',
  'PRESENTATION',
  'PANEL',
  'KEYNOTE',
  'NETWORKING',
  'OTHER',
  'CTF',
  'HACKATHON',
  'JAM',
] as const;

function normalizeSessionType(type?: string): string | undefined {
  if (!type) return undefined;
  const normalized = type.trim().toUpperCase();
  return (ALLOWED_SESSION_TYPES as readonly string[]).includes(normalized) ? normalized : undefined;
}

export const sessionsApi = {
  async getAll() {
    return apiClient.get<DataResultListSessionDto>('/api/sessions');
  },

  async create(data: CreateSessionRequest, speakerImage?: File) {
    const payload: CreateSessionRequest = {
      ...data,
      sessionType: normalizeSessionType(data.sessionType),
    };

    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    if (speakerImage) formData.append('speakerImage', speakerImage);

    return apiClient.postFormData<DataResultSessionDto>('/api/sessions', formData);
  },

  async getById(_id: string) {
    throw new Error('Postman sozlesmesine gore GET /api/sessions/:id endpointi tanimli degil');
  },

  async update(
    _id: string,
    _data: {
      eventId?: string;
      title?: string;
      speakerName?: string;
      speakerLinkedin?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      orderIndex?: number;
      sessionType?: string;
    },
  ) {
    throw new Error('Postman sozlesmesine gore PUT /api/sessions/:id endpointi tanimli degil');
  },

  async delete(id: string) {
    return apiClient.delete<DataResultVoid>(`/api/sessions/${id}`);
  },
};
