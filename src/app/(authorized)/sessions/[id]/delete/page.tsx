'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ModalDangerActions } from '@/components/ui/modal-actions';
import { eventsApi } from '@/lib/api/events';
import { sessionsApi } from '@/lib/api/sessions';
import type { EventDto, SessionDto } from '@/types/api';

export default function DeleteSessionPage() {
  return (
    <Suspense fallback={<DeleteSessionSkeleton />}>
      <DeleteSessionPageContent />
    </Suspense>
  );
}

function DeleteSessionSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Oturumu sil" />
      <div className="text-dark-500 mx-auto max-w-lg px-2 text-sm">Yükleniyor…</div>
    </div>
  );
}

function DeleteSessionPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = typeof params?.id === 'string' ? params.id : '';
  const eventId = searchParams.get('eventId') || '';

  const [isPending, startTransition] = useTransition();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [session, setSession] = useState<SessionDto | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !eventId) {
      setLoadState('idle');
      return;
    }

    let cancelled = false;
    setLoadState('loading');
    setLoadError(null);

    (async () => {
      try {
        const [eventRes, sessionRes] = await Promise.all([
          eventsApi.getById(eventId),
          sessionsApi.getById(sessionId, eventId),
        ]);

        if (cancelled) return;

        if (eventRes.success && eventRes.data) setEvent(eventRes.data);
        else setEvent(null);

        if (sessionRes.success && sessionRes.data?.id === sessionId) {
          setSession(sessionRes.data);
          setLoadState('ready');
        } else {
          setSession(null);
          setLoadError('Oturum bulunamadı veya bu etkinliğe ait değil.');
          setLoadState('error');
        }
      } catch {
        if (!cancelled) {
          setLoadError('Veriler yüklenirken hata oluştu.');
          setLoadState('error');
          setSession(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, eventId]);

  const handleDelete = () => {
    if (!sessionId) return;
    startTransition(async () => {
      try {
        const res = await sessionsApi.delete(sessionId);
        if (res.success) {
          router.push(`/events/${eventId}`);
          return;
        }
        alert(res.message || 'Oturum silinemedi.');
      } catch {
        alert('Oturum silinirken hata oluştu.');
      }
    });
  };

  const backHref = eventId ? `/events/${eventId}` : '/events';

  if (!eventId || !sessionId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Oturumu sil" />
        <div className="text-dark-500 mx-auto max-w-lg py-8 text-center text-sm">
          <p>Bağlam eksik. Etkinlik detayından gelin.</p>
          <Button href="/events" variant="secondary" className="mt-4">
            Etkinliklere dön
          </Button>
        </div>
      </div>
    );
  }

  if (loadState === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader title="Oturumu sil" />
        <div className="text-dark-600 mx-auto max-w-lg py-12 text-center text-sm">Yükleniyor…</div>
      </div>
    );
  }

  if (loadState === 'error' || !session) {
    return (
      <div className="space-y-6">
        <PageHeader title="Oturumu sil" />
        <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError || 'Oturum bulunamadı.'}
        </div>
        <div className="mx-auto max-w-lg text-center">
          <Button href={backHref} variant="secondary">
            Geri dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Oturumu sil" />
      <div className="mx-auto max-w-lg">
        <div className="bg-light border-dark-200 rounded-lg border p-6 shadow-sm">
          {event && (
            <p className="text-dark-600 mb-2 text-sm">
              <span className="text-dark-900 font-medium">{event.name}</span>
            </p>
          )}
          <p className="text-dark-800 text-sm">
            <strong>{session.title}</strong> oturumunu silmek istediğinize emin misiniz? Bu işlem
            geri alınamaz.
          </p>
          <ModalDangerActions
            className="border-dark-200 mt-6 border-t pt-5"
            cancelLabel="Vazgeç"
            onCancel={() => router.push(backHref)}
            onConfirm={handleDelete}
            isPending={isPending}
            pendingLabel="Siliniyor…"
          />
        </div>
      </div>
    </div>
  );
}
