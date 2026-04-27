'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { AutoFillSessionEndTime } from '@/components/forms/AutoFillSessionEndTime';
import { z } from 'zod';
import { sessionsApi } from '@/lib/api/sessions';
import { eventsApi } from '@/lib/api/events';
import { convertGMT3ToGMT0, getCurrentDateTimeGMT3 } from '@/lib/utils/date';
import { getLeaderEventType } from '@/lib/utils/permissions';
import { useAuth } from '@/context/AuthContext';

const sessionSchema = z.object({
  eventId: z.string().min(1, 'Etkinlik seciniz'),
  title: z.string().min(2, 'En az 2 karakter olmali'),
  speakerName: z.string().optional(),
  speakerLinkedin: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Baslangic zamani zorunlu'),
  endTime: z.string().optional(),
  orderIndex: z
    .string()
    .optional()
    .transform((val) => (val === '' || val === undefined ? undefined : parseInt(val, 10))),
  sessionType: z
    .enum([
      'WORKSHOP',
      'PRESENTATION',
      'PANEL',
      'KEYNOTE',
      'NETWORKING',
      'OTHER',
      'CTF',
      'HACKATHON',
      'JAM',
    ])
    .optional(),
});

export default function NewSessionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [events, setEvents] = useState<{ value: string; label: string; type?: string }[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    eventsApi
      .getAll()
      .then((response) => {
        if (response.success && response.data) {
          setEvents(
            response.data.map((event) => ({
              value: event.id,
              label: event.name,
              type: event.type?.name,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (data: z.infer<typeof sessionSchema>) => {
    startTransition(async () => {
      try {
        await sessionsApi.create({
          eventId: data.eventId,
          title: data.title,
          speakerName: data.speakerName || undefined,
          speakerLinkedin: data.speakerLinkedin || undefined,
          description: data.description || undefined,
          startTime: convertGMT3ToGMT0(data.startTime),
          endTime: data.endTime ? convertGMT3ToGMT0(data.endTime) : undefined,
          orderIndex: data.orderIndex,
          sessionType: data.sessionType,
        });
        router.push('/sessions');
      } catch (error) {
        alert(
          'Oturum olusturulurken hata olustu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  const filteredEvents =
    currentUser && getLeaderEventType(currentUser)
      ? events.filter((e) => e.type === getLeaderEventType(currentUser))
      : events;

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Oturum" description="Sisteme yeni oturum ekleyin" />
      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={sessionSchema}
            onSubmit={handleSubmit}
            defaultValues={{ eventId: '', startTime: getCurrentDateTimeGMT3() }}
          >
            {() => (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Select name="eventId" label="Etkinlik" options={filteredEvents} required />
                  <TextField name="title" label="Baslik" required placeholder="Oturum basligi" />
                  <TextField name="speakerName" label="Konusmaci Adi" />
                  <TextField name="speakerLinkedin" label="Konusmaci LinkedIn" type="url" />
                  <Select
                    name="sessionType"
                    label="Oturum Tipi"
                    options={[
                      { value: 'WORKSHOP', label: 'Workshop' },
                      { value: 'PRESENTATION', label: 'Sunum' },
                      { value: 'PANEL', label: 'Panel' },
                      { value: 'KEYNOTE', label: 'Keynote' },
                      { value: 'NETWORKING', label: 'Networking' },
                      { value: 'CTF', label: 'CTF' },
                      { value: 'HACKATHON', label: 'Hackathon' },
                      { value: 'JAM', label: 'Jam' },
                      { value: 'OTHER', label: 'Diger' },
                    ]}
                  />
                  <TextField name="orderIndex" label="Sira" type="number" />
                  <TextField
                    name="startTime"
                    label="Baslangic Zamani"
                    type="datetime-local"
                    required
                  />
                  <TextField name="endTime" label="Bitis Zamani" type="datetime-local" />
                </div>
                <Textarea name="description" label="Aciklama" rows={4} />
                <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                  <AutoFillSessionEndTime />
                  <div className="flex items-center gap-3">
                    <Button href="/sessions" variant="secondary">
                      Iptal
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
