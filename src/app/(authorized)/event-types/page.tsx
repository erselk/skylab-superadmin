'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { CreatePageButton } from '@/components/ui/CreatePageButton';
import { Modal } from '@/components/ui/Modal';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventTypeDto } from '@/types/api';

export default function EventTypesPage() {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadEventTypes = () => {
    setLoading(true);
    eventTypesApi
      .getAll()
      .then((response) => {
        if (response.success && response.data) {
          setEventTypes(response.data);
        } else {
          setError('Etkinlik tipleri yüklenirken hata oluştu');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Event types fetch error:', err);
        setError(err instanceof Error ? err.message : 'Etkinlik tipleri yüklenirken hata oluştu');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const handleEdit = (eventType: EventTypeDto) => {
    router.push(`/event-types/${eventType.id}/edit`);
  };

  if (loading) {
    return <div className="py-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlik Tipleri"
        actions={<CreatePageButton href="/event-types/new">Yeni Etkinlik Tipi</CreatePageButton>}
      />
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error}</p>
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="bg-light border-dark-200 rounded-lg border p-6 text-center">
          <p className="text-dark opacity-60">Henüz etkinlik tipi bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {eventTypes.map((et) => (
            <div
              key={et.id}
              onClick={() => handleEdit(et)}
              className="bg-light border-dark-200 hover:bg-brand-50 hover:border-brand cursor-pointer rounded-md border p-3 transition"
            >
              <div className="text-dark-900 text-sm font-medium">{et.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
