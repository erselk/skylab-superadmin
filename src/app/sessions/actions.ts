'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListSessionDto,
  DataResultSessionDto,
  CreateSessionRequest,
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

function normalizeSessionType(type: FormDataEntryValue | null): string | undefined {
  if (typeof type !== 'string' || !type.trim()) return undefined;
  const normalized = type.trim().toUpperCase();
  return (ALLOWED_SESSION_TYPES as readonly string[]).includes(normalized) ? normalized : undefined;
}

export async function getSessions() {
  try {
    const response = await serverFetch<DataResultListSessionDto>('/api/sessions');

    if (!response || !response.data) {
      return [];
    }

    return response.data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    if (errorMessage.includes('not.found') || errorMessage.includes('404')) {
      return [];
    }
    console.error('getSessions error:', error);
    throw new Error(`Oturumlar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createSession(formData: FormData) {
  const data: CreateSessionRequest = {
    eventId: formData.get('eventId') as string,
    title: formData.get('title') as string,
    speakerName: (formData.get('speakerName') as string) || undefined,
    speakerLinkedin: (formData.get('speakerLinkedin') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    startTime: formData.get('startTime') as string,
    endTime: (formData.get('endTime') as string) || undefined,
    orderIndex: parseInt(formData.get('orderIndex') as string) || undefined,
    sessionType: normalizeSessionType(formData.get('sessionType')),
  };

  try {
    await serverFetch<DataResultSessionDto>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createSession error:', error);
    throw error;
  }
}

export async function deleteSession(id: string) {
  try {
    await serverFetch(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteSession error:', error);
    throw error;
  }
}
