'use server';

import { eventsApi } from '@/lib/api/events';

export async function getEvents(params?: {
  includeEventType?: boolean;
  includeSession?: boolean;
  includeCompetitors?: boolean;
  includeImages?: boolean;
  includeSeason?: boolean;
  includeCompetition?: boolean;
}) {
  try {
    const response = await eventsApi.getAll(params);
    return response.data || [];
  } catch (error) {
    throw new Error('Etkinlikler yüklenirken hata oluştu');
  }
}

export async function getEventById(id: string) {
  try {
    const response = await eventsApi.getById(id);
    return response.data;
  } catch (error) {
    throw new Error('Etkinlik yüklenirken hata oluştu');
  }
}

export async function createEvent(formData: FormData) {
  const coverImage = formData.get('coverImage') as File;
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    location: formData.get('location') as string,
    eventTypeId: formData.get('eventTypeId') as string,
    formUrl: formData.get('formUrl') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    linkedin: formData.get('linkedin') as string,
    active: formData.get('active') === 'true',
    competitionId: formData.get('competitionId') as string,
  };

  try {
    await eventsApi.create(coverImage, data);
  } catch (error) {
    throw error;
  }
}

