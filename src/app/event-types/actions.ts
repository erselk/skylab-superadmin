'use server';

import { eventTypesApi } from '@/lib/api/event-types';

export async function getEventTypes() {
  try {
    const response = await eventTypesApi.getAll();
    return response.data || [];
  } catch (error) {
    throw new Error('Etkinlik tipleri yüklenirken hata oluştu');
  }
}

export async function getEventTypeById(id: string) {
  try {
    const response = await eventTypesApi.getById(id);
    return response.data;
  } catch (error) {
    throw new Error('Etkinlik tipi yüklenirken hata oluştu');
  }
}

export async function createEventType(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
  };

  try {
    await eventTypesApi.create(data);
  } catch (error) {
    throw error;
  }
}

export async function updateEventType(id: string, formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    competitive: formData.get('competitive') === 'true',
  };

  try {
    await eventTypesApi.update(id, data);
  } catch (error) {
    throw error;
  }
}

export async function deleteEventType(id: string) {
  try {
    await eventTypesApi.delete(id);
  } catch (error) {
    throw error;
  }
}

