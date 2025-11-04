'use server';

import { competitionsApi } from '@/lib/api/competitions';

export async function getCompetitions(params?: { includeEvent?: boolean; includeEventType?: boolean }) {
  try {
    const response = await competitionsApi.getAll(params);
    return response.data || [];
  } catch (error) {
    throw new Error('Yarışmalar yüklenirken hata oluştu');
  }
}

export async function getCompetitionById(id: string) {
  try {
    const response = await competitionsApi.getById(id);
    return response.data;
  } catch (error) {
    throw new Error('Yarışma yüklenirken hata oluştu');
  }
}

export async function createCompetition(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true',
    eventTypeId: formData.get('eventTypeId') as string,
  };

  try {
    await competitionsApi.create(data);
  } catch (error) {
    throw error;
  }
}

export async function updateCompetition(id: string, formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true',
  };

  try {
    await competitionsApi.update(id, data);
  } catch (error) {
    throw error;
  }
}

export async function deleteCompetition(id: string) {
  try {
    await competitionsApi.delete(id);
  } catch (error) {
    throw error;
  }
}

