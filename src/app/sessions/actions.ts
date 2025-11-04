'use server';

import { sessionsApi } from '@/lib/api/sessions';

export async function getSessions(params?: { includeEvent?: boolean }) {
  try {
    const response = await sessionsApi.getAll(params);
    return response.data || [];
  } catch (error) {
    throw new Error('Oturumlar yüklenirken hata oluştu');
  }
}

export async function createSession(formData: FormData) {
  const data = {
    eventId: formData.get('eventId') as string,
    title: formData.get('title') as string,
    speakerName: formData.get('speakerName') as string,
    speakerLinkedin: formData.get('speakerLinkedin') as string,
    description: formData.get('description') as string,
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    orderIndex: parseInt(formData.get('orderIndex') as string) || 0,
    sessionType: formData.get('sessionType') as any,
  };

  try {
    await sessionsApi.create(data);
  } catch (error) {
    throw error;
  }
}

export async function deleteSession(id: string) {
  try {
    await sessionsApi.delete(id);
  } catch (error) {
    throw error;
  }
}

