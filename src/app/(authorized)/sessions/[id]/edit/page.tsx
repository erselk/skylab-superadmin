'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { HiOutlineTrash } from 'react-icons/hi2';

import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { z } from 'zod';
import { sessionsApi } from '@/lib/api/sessions';
import { useAuth } from '@/context/AuthContext';
import {
  canOperateEventScheduling,
  canOperateEventSchedulingOnEvent,
} from '@/lib/utils/permissions';
import { eventDaysApi } from '@/lib/api/eventDays';
import { eventsApi } from '@/lib/api/events';
import type { EventDto, GetEventDayResponseDto, SessionDto } from '@/types/api';
import { zOptionalLinkedInUrl } from '@/lib/utils/linkedinZod';

const SESSION_TYPES = [
  'WORKSHOP',
  'PRESENTATION',
  'PANEL',
  'KEYNOTE',
  'NETWORKING',
  'OTHER',
  'CTF',
  'HACKATHON',
  'JAM',
] as const;

const editSessionSchema = z.object({
  title: z.string().min(2, 'En az 2 karakter olmalı'),
  speakerName: z.string().optional(),
  speakerLinkedin: zOptionalLinkedInUrl,
  description: z.string().optional(),
  startTime: z.string().min(1, 'Başlangıç saati zorunlu'),
  endTime: z.string().optional(),
  sessionType: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.enum(SESSION_TYPES).optional(),
  ),
});

function sortDaysByStart(d: GetEventDayResponseDto[]) {
  return [...d].sort(
    (a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime(),
  );
}

function isoToTimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function coerceSessionType(s?: string): (typeof SESSION_TYPES)[number] | undefined {
  if (!s) return undefined;
  const up = s.trim().toUpperCase();
  return (SESSION_TYPES as readonly string[]).includes(up)
    ? (up as (typeof SESSION_TYPES)[number])
    : undefined;
}

export default function EditSessionPage() {
  return (
    <Suspense fallback={<EditSessionSkeleton />}>
      <EditSessionPageContent />
    </Suspense>
  );
}

function EditSessionSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Oturum düzenle" />
      <div className="text-dark-500 mx-auto max-w-3xl px-2 text-sm">Yükleniyor…</div>
    </div>
  );
}

function EditSessionPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = typeof params?.id === 'string' ? params.id : '';

  const eventId = searchParams.get('eventId') || '';
  const { user, loading: authLoading } = useAuth();

  const [isPending, startTransition] = useTransition();
  const [eventDays, setEventDays] = useState<GetEventDayResponseDto[]>([]);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [session, setSession] = useState<SessionDto | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!canOperateEventScheduling(user ?? null)) {
      router.replace(eventId ? `/events/${eventId}` : '/events');
    }
  }, [authLoading, user, router, eventId]);

  useEffect(() => {
    if (authLoading || !user || !canOperateEventScheduling(user)) return;
    if (!eventId || !event) return;
    if (!canOperateEventSchedulingOnEvent(user, event.type?.name)) {
      router.replace(`/events/${eventId}`);
    }
  }, [authLoading, user, eventId, event, router]);

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
        const [eventRes, daysRes, sessionRes] = await Promise.all([
          eventsApi.getById(eventId),
          eventDaysApi.getByEventId(eventId),
          sessionsApi.getById(sessionId, eventId),
        ]);

        if (cancelled) return;

        if (eventRes.success && eventRes.data) setEvent(eventRes.data);
        else setEvent(null);

        setEventDays(daysRes.success && daysRes.data ? sortDaysByStart(daysRes.data) : []);

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

  const handleSubmit = async (data: z.infer<typeof editSessionSchema>) => {
    if (!sessionId || !session) return;
    if (!canOperateEventSchedulingOnEvent(user ?? null, event?.type?.name)) {
      router.replace(eventId ? `/events/${eventId}` : '/events');
      return;
    }

    startTransition(async () => {
      try {
        const selectedDay = session.eventDayId
          ? eventDays.find((d) => d.id === session.eventDayId)
          : undefined;

        let dayDate: Date;
        if (selectedDay?.startDate) {
          dayDate = new Date(selectedDay.startDate);
        } else if (session.startTime) {
          dayDate = new Date(session.startTime);
        } else {
          throw new Error('Gün tarihi bulunamadı.');
        }

        const yyyy = dayDate.getFullYear();
        const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(dayDate.getDate()).padStart(2, '0');

        const startParts = data.startTime.split(':');
        const startHH = startParts[0] ?? '00';
        const startMM = startParts[1] ?? '00';
        const fullStartDate = new Date(`${yyyy}-${mm}-${dd}T${startHH}:${startMM}:00`);

        let fullEndDate: Date | undefined;
        if (data.endTime) {
          const endParts = data.endTime.split(':');
          const endHH = endParts[0] ?? '00';
          const endMM = endParts[1] ?? '00';
          fullEndDate = new Date(`${yyyy}-${mm}-${dd}T${endHH}:${endMM}:00`);
        }

        const linkedin =
          typeof data.speakerLinkedin === 'string' && data.speakerLinkedin.trim() !== ''
            ? data.speakerLinkedin.trim()
            : undefined;

        const res = await sessionsApi.update(sessionId, {
          title: data.title,
          speakerName: data.speakerName || undefined,
          speakerLinkedin: linkedin,
          description: data.description || undefined,
          startTime: fullStartDate.toISOString(),
          endTime: fullEndDate ? fullEndDate.toISOString() : undefined,
          sessionType: data.sessionType,
        });

        if (!res.success) {
          throw new Error(res.message || 'Güncelleme başarısız');
        }

        router.push(`/events/${eventId}`);
      } catch (error) {
        alert(
          'Oturum güncellenirken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  if (!eventId || !sessionId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Oturum düzenle" />
        <div className="text-dark-500 mx-auto max-w-3xl py-8 text-center text-sm">
          <p>eventId veya oturum id eksik. Etkinlik detayından düzenle ile gelin.</p>
          <Button href="/events" variant="secondary" className="mt-4">
            Etkinliklere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (loadState === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader title="Oturum düzenle" description={event?.name} />
        <div className="text-dark-600 mx-auto max-w-3xl py-12 text-center text-sm">
          Oturum yükleniyor…
        </div>
      </div>
    );
  }

  if (loadState === 'error' || !session) {
    return (
      <div className="space-y-6">
        <PageHeader title="Oturum düzenle" description={event?.name} />
        <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError || 'Oturum bulunamadı.'}
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <Button href={`/events/${eventId}`} variant="secondary">
            Etkinliğe Dön
          </Button>
        </div>
      </div>
    );
  }

  const defaults: z.infer<typeof editSessionSchema> = {
    title: session.title,
    speakerName: session.speakerName ?? '',
    speakerLinkedin: session.speakerLinkedin ?? '',
    description: session.description ?? '',
    startTime: isoToTimeInput(session.startTime),
    endTime: isoToTimeInput(session.endTime),
    sessionType: coerceSessionType(session.sessionType),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oturum düzenle"
        description={event?.name}
        actions={
          <Button
            href={`/sessions/${sessionId}/delete?eventId=${eventId}`}
            variant="secondary"
            title="Oturumu sil"
            aria-label="Oturumu sil"
            className="hover:!bg-danger-50 !inline-flex !items-center !justify-center !border-0 !bg-transparent !px-3 !py-2"
          >
            <HiOutlineTrash className="text-danger h-5 w-5" />
          </Button>
        }
      />
      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          {event && (
            <div className="border-dark-200 bg-dark-50 mb-5 rounded-lg border px-4 py-3 text-sm">
              <p className="text-dark-800 font-medium">{event.name}</p>
              {event.location && <p className="text-dark-500 mt-0.5">{event.location}</p>}
            </div>
          )}
          <Form
            key={session.id}
            schema={editSessionSchema}
            defaultValues={defaults}
            onSubmit={handleSubmit}
          >
            {() => (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <TextField name="title" label="Başlık" required placeholder="Oturum başlığı" />
                  </div>
                  <TextField name="speakerName" label="Konuşmacı adı" />
                  <TextField
                    name="speakerLinkedin"
                    label="Konuşmacı LinkedIn"
                    type="text"
                    placeholder="linkedin.com/in/… veya tam URL"
                  />
                  <div className="col-span-2">
                    <Select
                      name="sessionType"
                      label="Oturum tipi"
                      placeholder="Seçiniz"
                      options={[
                        { value: 'WORKSHOP', label: 'Workshop' },
                        { value: 'PRESENTATION', label: 'Sunum' },
                        { value: 'PANEL', label: 'Panel' },
                        { value: 'KEYNOTE', label: 'Keynote' },
                        { value: 'NETWORKING', label: 'Networking' },
                        { value: 'CTF', label: 'CTF' },
                        { value: 'HACKATHON', label: 'Hackathon' },
                        { value: 'JAM', label: 'Jam' },
                        { value: 'OTHER', label: 'Diğer' },
                      ]}
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <TextField name="startTime" label="Başlangıç saati" type="time" required />
                      </div>
                      <div className="flex-1">
                        <TextField name="endTime" label="Bitiş saati" type="time" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Textarea name="description" label="Açıklama" rows={4} />
                </div>
                <FormActions
                  cancel={
                    <Button href={`/events/${eventId}`} variant="outlineDanger">
                      İptal
                    </Button>
                  }
                  submit={
                    <Button type="submit" variant="outlineBrand" disabled={isPending}>
                      {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  }
                />
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
