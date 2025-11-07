'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { EventDto } from '@/types/api';
import { eventsApi } from '@/lib/api/events';
import { eventTypesApi } from '@/lib/api/event-types';
import { EventsGridClient } from './EventsGridClient';

export default function EventsPage() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [eventTypeOrder, setEventTypeOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsResponse, eventTypesResponse] = await Promise.all([
        eventsApi.getAll({ includeEventType: true }),
        eventTypesApi.getAll(),
      ]);

      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      } else {
        setError(eventsResponse.message || 'Etkinlikler yüklenirken hata oluştu');
      }

      if (eventTypesResponse.success && eventTypesResponse.data) {
        setEventTypeOrder(eventTypesResponse.data.map((type) => type.name));
      } else {
        setEventTypeOrder([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etkinlikler yüklenirken hata oluştu');
      console.error('Events page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Etkinlikler"
          description="Tüm etkinlikleri görüntüleyin ve yönetin"
          actions={(
            <Link href="/events/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Etkinlik
                </span>
              </Button>
            </Link>
          )}
        />

        {loading ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center text-dark-600">Yükleniyor...</div>
        ) : error ? (
          <div className="bg-light border border-danger rounded-lg p-6 text-danger">
            <p className="font-medium">Hata oluştu</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center text-dark-600">
            Henüz etkinlik bulunmuyor.
          </div>
        ) : (
          <EventsGridClient
            events={events}
            eventTypeOrder={eventTypeOrder}
          />
        )}
      </div>
    </AppShell>
  );
}
