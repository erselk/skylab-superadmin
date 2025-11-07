'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { CompetitionDto } from '@/types/api';
import { competitionsApi } from '@/lib/api/competitions';
import { eventTypesApi } from '@/lib/api/event-types';
import { CompetitionsGridClient } from './CompetitionsGridClient';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<CompetitionDto[]>([]);
  const [eventTypeOrder, setEventTypeOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  

  const loadCompetitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [competitionsResponse, eventTypesResponse] = await Promise.all([
        competitionsApi.getAll({ includeEventType: true }),
        eventTypesApi.getAll(),
      ]);

      if (competitionsResponse.success && competitionsResponse.data) {
        setCompetitions(competitionsResponse.data);
      } else {
        setError(competitionsResponse.message || 'Yarışmalar yüklenirken hata oluştu');
      }

      if (eventTypesResponse.success && eventTypesResponse.data) {
        setEventTypeOrder(eventTypesResponse.data.map((type) => type.name));
      } else {
        setEventTypeOrder([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yarışmalar yüklenirken hata oluştu');
      console.error('Competitions page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Yarışmalar"
          description="Yarışmaları görüntüleyin ve yönetin"
          actions={(
            <Link href="/competitions/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Yarışma
                </span>
              </Button>
            </Link>
          )}
        />

        {loading ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center text-dark-600">Yükleniyor...</div>
        ) : competitions.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center text-dark-600">
            Henüz yarışma bulunmamaktadır.
          </div>
        ) : (
          <CompetitionsGridClient
            competitions={competitions}
            eventTypeOrder={eventTypeOrder}
          />
        )}
      </div>
      
    </AppShell>
  );
}
