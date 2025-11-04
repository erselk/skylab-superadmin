'use server';

import { announcementsApi } from '@/lib/api/announcements';

export async function getAnnouncements(params?: {
  includeUser?: boolean;
  includeEventType?: boolean;
  includeImages?: boolean;
}) {
  try {
    const response = await announcementsApi.getAll(params);
    return response.data || [];
  } catch (error) {
    throw new Error('Duyurular yüklenirken hata oluştu');
  }
}

export async function getAnnouncementById(id: string) {
  try {
    const response = await announcementsApi.getById(id);
    return response.data;
  } catch (error) {
    throw new Error('Duyuru yüklenirken hata oluştu');
  }
}

export async function createAnnouncement(formData: FormData) {
  const coverImage = formData.get('coverImage') as File | null;
  const data = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    active: formData.get('active') === 'true',
    eventTypeId: formData.get('eventTypeId') as string,
    formUrl: formData.get('formUrl') as string,
  };

  try {
    await announcementsApi.create(data, coverImage || undefined);
  } catch (error) {
    throw error;
  }
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const data = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    active: formData.get('active') === 'true',
    eventTypeId: formData.get('eventTypeId') as string,
    formUrl: formData.get('formUrl') as string,
  };

  try {
    await announcementsApi.update(id, data);
  } catch (error) {
    throw error;
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await announcementsApi.delete(id);
  } catch (error) {
    throw error;
  }
}

