'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListCompetitionDto,
  DataResultCompetitionDto,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
} from '@/types/api';

export async function getCompetitions(params?: { includeEvent?: boolean; includeEventType?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    
    const endpoint = qs ? `/api/competitions/?${qs}` : `/api/competitions/`;
    const response = await serverFetch<DataResultListCompetitionDto>(endpoint);
    
    console.log('Competitions API Response (full):', JSON.stringify(response, null, 2));
    console.log('Competitions API Response:', {
      success: response?.success,
      message: response?.message,
      hasData: !!response?.data,
      dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
      dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
      responseKeys: response ? Object.keys(response) : 'no response',
    });
    
    // Eğer response boş obje ise ({}) veya hiç property yoksa, boş array döndür
    if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
      console.warn('API boş yanıt döndü, boş array döndürülüyor');
      return [];
    }

    // Eğer data array ise ve success false olsa bile, boş liste döndürebiliriz
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Eğer success false ise ve mesaj varsa hata fırlat
    if (response.success === false) {
      const errorMessage = response.message || 'API isteği başarısız';
      console.error('API Error Details:', {
        message: response.message,
        httpStatus: response.httpStatus,
        path: response.path,
        timeStamp: response.timeStamp,
      });
      throw new Error(errorMessage);
    }

    // Eğer response var ama success undefined ise ve data yoksa, muhtemelen boş liste
    if (response.success === undefined && !response.data) {
      console.warn('API yanıtında success ve data yok, boş array döndürülüyor');
      return [];
    }

    // data property'si olmalı ve array olmalı
    if (response.data && !Array.isArray(response.data)) {
      throw new Error('Geçersiz API yanıtı: data bir array değil');
    }
    
    // Eğer buraya geldiysek ve data varsa döndür
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getCompetitions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Yarışmalar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getCompetitionById(id: string, params?: { includeEvent?: boolean; includeEventType?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    
    const response = await serverFetch<DataResultCompetitionDto>(
      `/api/competitions/${id}${qs ? `?${qs}` : ''}`
    );
    
    if (!response) {
      throw new Error('API yanıtı alınamadı');
    }

    if (response.success === false) {
      throw new Error(response.message || 'API isteği başarısız');
    }

    if (!response.data) {
      throw new Error('Geçersiz API yanıtı: data bulunamadı');
    }
    
    return response.data;
  } catch (error) {
    console.error('getCompetitionById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Yarışma yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createCompetition(formData: FormData) {
  const data: CreateCompetitionRequest = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true',
    eventTypeId: formData.get('eventTypeId') as string,
  };

  try {
    await serverFetch<DataResultCompetitionDto>('/api/competitions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createCompetition error:', error);
    throw error;
  }
}

export async function updateCompetition(id: string, formData: FormData) {
  const data: UpdateCompetitionRequest = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true',
  };

  try {
    await serverFetch<DataResultCompetitionDto>(`/api/competitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateCompetition error:', error);
    throw error;
  }
}

export async function deleteCompetition(id: string) {
  try {
    await serverFetch(`/api/competitions/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteCompetition error:', error);
    throw error;
  }
}

export async function addEventToCompetition(competitionId: string, eventId: string) {
  try {
    await serverFetch(`/api/competitions/${competitionId}/events/${eventId}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('addEventToCompetition error:', error);
    throw error;
  }
}

