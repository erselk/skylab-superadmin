import { apiClient } from './client';
import type {
  DataResultListSessionDto,
  DataResultSessionDto,
  SessionDto,
  CreateSessionRequest,
  UpdateSessionRequest,
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

/** OpenAPI: GET /api/sessions/{id} yok; tekil oturum etkinlik kapsamlı liste veya tüm liste üzerinden bulunur. */
function wrapSession(found: SessionDto, source: DataResultListSessionDto): DataResultSessionDto {
  return {
    success: true,
    message: source.message,
    httpStatus: source.httpStatus,
    path: source.path,
    timeStamp: source.timeStamp,
    data: found,
  };
}

function sessionNotFoundResult(sessionId: string): DataResultSessionDto {
  const now = new Date().toISOString();
  return {
    success: false,
    message: 'session.not.found',
    httpStatus: '404',
    path: '',
    timeStamp: now,
    data: { id: sessionId, title: '' },
  };
}

export const sessionsApi = {
  async getAll() {
    return apiClient.get<DataResultListSessionDto>('/api/sessions');
  },

  /** GET /api/events/{eventId}/sessions */
  async listByEventId(eventId: string) {
    return apiClient.get<DataResultListSessionDto>(`/api/events/${eventId}/sessions`);
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

  /** OpenAPI: PUT /api/sessions/{id}, application/json, UpdateSessionRequest */
  async update(id: string, data: UpdateSessionRequest) {
    const payload: UpdateSessionRequest = {
      ...data,
      sessionType: normalizeSessionType(data.sessionType),
    };
    return apiClient.put<DataResultSessionDto>(`/api/sessions/${id}`, payload);
  },

  /**
   * Tekil oturum. API’de GET /api/sessions/{id} tanımlı değildir (Super Skylab OpenAPI).
   * @param eventIdHint URL’den veya bağlamdan; varsa önce etkinlik oturum listesi kullanılır (daha hızlı/az veri).
   */
  async getById(sessionId: string, eventIdHint?: string): Promise<DataResultSessionDto> {
    if (eventIdHint) {
      try {
        const byEvent = await this.listByEventId(eventIdHint);
        if (byEvent.success && Array.isArray(byEvent.data)) {
          const found = byEvent.data.find((s) => s.id === sessionId);
          if (found) return wrapSession(found, byEvent);
        }
      } catch {
        /* 403 vb. → getAll ile dene */
      }
    }

    try {
      const all = await this.getAll();
      if (all.success && Array.isArray(all.data)) {
        const found = all.data.find((s) => s.id === sessionId);
        if (found) return wrapSession(found, all);
      }
    } catch {
      /* swallow */
    }

    return sessionNotFoundResult(sessionId);
  },

  async delete(id: string) {
    return apiClient.delete<DataResultVoid>(`/api/sessions/${id}`);
  },
};
