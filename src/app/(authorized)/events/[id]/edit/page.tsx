'use client';

import { useState, useTransition, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineTrash } from 'react-icons/hi2';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { ModalDangerActions } from '@/components/ui/modal-actions';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';
import { z } from 'zod';
import { eventsApi } from '@/lib/api/events';
import { eventTypesApi } from '@/lib/api/event-types';
import { seasonsApi } from '@/lib/api/seasons';
import type { EventDto } from '@/types/api';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';
import {
  canEditFullEventMetadata,
  canOperateEventScheduling,
  canOperateEventSchedulingOnEvent,
  eventTypeMatchesLeaderScope,
  getSkylabLeaderEventScopeType,
  hasSkylabEventLeaderRole,
  isSuperAdmin,
} from '@/lib/utils/permissions';
import { useAuth } from '@/context/AuthContext';

const eventSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  description: z.string().optional(),
  location: z.string().optional(),
  eventTypeId: z.string().min(1, 'Etkinlik tipi seçiniz'),
  formUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string(),
  endDate: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  active: z.boolean().optional(),
  competitionId: z.string().optional(),
  seasonId: z.string().optional(),
  ranked: z.boolean().optional(),
  prizeInfo: z.string().optional(),
  coverImage: z
    .custom<File | undefined>((val) => val === undefined || val instanceof File)
    .optional(),
});

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isPending, startTransition] = useTransition();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isRanked, setIsRanked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user: currentUser, loading: authLoading } = useAuth();
  const [seasons, setSeasons] = useState<{ value: string; label: string }[]>([]);
  const showFullEventFields = canEditFullEventMetadata(currentUser);

  useEffect(() => {
    if (authLoading) return;
    if (!canOperateEventScheduling(currentUser ?? null)) {
      router.replace(`/events/${id}`);
    }
  }, [authLoading, currentUser, id, router]);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!event || error) return;
    if (!canOperateEventSchedulingOnEvent(currentUser ?? null, event.type?.name)) {
      router.replace(`/events/${id}`);
    }
  }, [authLoading, loading, event, error, currentUser, id, router]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      try {
        const [eventResponse, eventTypesResponse] = await Promise.all([
          eventsApi.getById(id),
          eventTypesApi.getAll(),
        ]);
        if (cancelled) return;

        if (eventResponse.success && eventResponse.data) {
          setEvent(eventResponse.data);
          setIsActive(eventResponse.data.active ?? true);
          setIsRanked(eventResponse.data.ranked ?? false);
        } else {
          setError('Etkinlik bulunamadı');
        }

        if (eventTypesResponse.success && eventTypesResponse.data) {
          setEventTypes(eventTypesResponse.data.map((et) => ({ value: et.id, label: et.name })));
        }

        const privileged = canEditFullEventMetadata(currentUser);
        if (privileged) {
          const seasonsResponse = await seasonsApi.getAll();
          if (!cancelled && seasonsResponse.success && seasonsResponse.data) {
            setSeasons(seasonsResponse.data.map((s) => ({ value: s.id, label: s.name })));
          }
        } else if (!cancelled) {
          setSeasons([]);
        }
      } catch (err) {
        console.error('Event fetch error:', err);
        if (!cancelled) {
          setError('Etkinlik yüklenirken hata oluştu');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  const handleSubmit = async (data: z.infer<typeof eventSchema>) => {
    if (!canOperateEventSchedulingOnEvent(currentUser ?? null, event?.type?.name)) {
      router.replace(`/events/${id}`);
      return;
    }

    if (currentUser && hasSkylabEventLeaderRole(currentUser) && !isSuperAdmin(currentUser)) {
      const scope = getSkylabLeaderEventScopeType(currentUser);
      const selectedType = eventTypes.find((t) => t.value === data.eventTypeId);
      if (selectedType && !eventTypeMatchesLeaderScope(selectedType.label, scope)) {
        alert('Bu etkinlik tipini düzenleme yetkiniz yok.');
        return;
      }
    }

    startTransition(async () => {
      try {
        // Note: Backend currently does not support updating cover image via PUT /api/events/{id}
        // So we ignore data.coverImage for now or implement a separate image upload flow if backend supports it later.

        const privileged = canEditFullEventMetadata(currentUser);
        const eventData = {
          name: data.name,
          description: data.description || undefined,
          location: data.location || undefined,
          typeId: data.eventTypeId,
          formUrl: privileged ? data.formUrl || undefined : event?.formUrl || undefined,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: data.endDate ? convertGMT3ToGMT0(data.endDate) : undefined,
          linkedin: privileged ? data.linkedin || undefined : event?.linkedin || undefined,
          active: privileged ? isActive : (event?.active ?? true),
          ranked: privileged ? isRanked : (event?.ranked ?? false),
          prizeInfo: privileged ? data.prizeInfo || undefined : event?.prizeInfo || undefined,
          competitionId: privileged
            ? data.competitionId || undefined
            : event?.competition?.id || undefined,
        };

        await eventsApi.update(id, eventData);

        if (privileged && event) {
          const currentSeasonId = event.season?.id;
          const newSeasonId = data.seasonId;

          if (newSeasonId !== currentSeasonId) {
            if (newSeasonId) {
              await eventsApi.assignSeason(id, newSeasonId);
            } else if (currentSeasonId) {
              await eventsApi.removeSeason(id);
            }
          }
        }

        router.push(`/events/${id}`);
      } catch (error) {
        console.error('Event update error:', error);
        alert(
          'Etkinlik güncellenirken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!canOperateEventSchedulingOnEvent(currentUser ?? null, event.type?.name)) {
      setShowDeleteModal(false);
      return;
    }
    setIsDeleting(true);
    try {
      await eventsApi.delete(event.id);
      router.push('/events');
    } catch (err) {
      console.error('Event delete error:', err);
      alert(
        'Etkinlik silinirken hata oluştu: ' +
          (err instanceof Error ? err.message : 'Bilinmeyen hata'),
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="py-8 text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Etkinlik bulunamadı'}</p>
          <Button href={`/events/${id}`} variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const typeLocked =
    !!currentUser && hasSkylabEventLeaderRole(currentUser) && !isSuperAdmin(currentUser);
  const canDeleteThisEvent = canOperateEventSchedulingOnEvent(
    currentUser ?? null,
    event.type?.name,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlik Düzenle"
        description={event.name}
        actions={
          showFullEventFields || canDeleteThisEvent ? (
            <div className="flex items-center gap-4">
              {showFullEventFields ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-dark-600 text-xs font-medium">Aktif</span>
                    <Toggle checked={isActive} onChange={setIsActive} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-dark-600 text-xs font-medium">Sıralamalı</span>
                    <Toggle checked={isRanked} onChange={setIsRanked} />
                  </div>
                </>
              ) : null}
              {canDeleteThisEvent ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-center !border-0 !bg-transparent !px-3 !py-3 hover:!bg-transparent"
                  aria-label="Etkinliği sil"
                >
                  <HiOutlineTrash className="text-danger h-5 w-5" />
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={eventSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              name: event.name,
              description: event.description || '',
              location: event.location || '',
              eventTypeId: event.type?.id || '',
              formUrl: event.formUrl || '',
              startDate: event.startDate ? formatGMT0ToLocalInput(event.startDate) : '',
              endDate: event.endDate ? formatGMT0ToLocalInput(event.endDate) : '',
              linkedin: event.linkedin || '',
              seasonId: event.season?.id || '',
              prizeInfo: event.prizeInfo || '',
              competitionId: event.competition?.id || '',
              coverImage: undefined,
            }}
          >
            {(methods) => {
              const formErrors = methods.formState.errors;
              return (
                <>
                  {Object.keys(formErrors).length > 0 && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-medium text-red-800">Form hataları:</p>
                      <ul className="list-inside list-disc text-sm text-red-600">
                        {Object.entries(formErrors).map(([key, error]) => (
                          <li key={key}>
                            {key}: {error?.message as string}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Temel Bilgiler</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <TextField
                          name="name"
                          label="Ad"
                          required
                          placeholder="Yazılım Geliştirme Workshop'u"
                        />
                        <Select
                          name="eventTypeId"
                          label="Etkinlik Tipi"
                          options={eventTypes}
                          required
                          disabled={typeLocked}
                        />
                        <TextField
                          name="location"
                          label="Konum"
                          placeholder="YTÜ Davutpaşa Kampüsü"
                        />
                        {showFullEventFields ? (
                          <Select
                            name="seasonId"
                            label="Sezon"
                            options={seasons}
                            placeholder="Sezon Seçiniz (Opsiyonel)"
                          />
                        ) : null}
                        {showFullEventFields ? (
                          <TextField
                            name="formUrl"
                            label="Form URL"
                            type="url"
                            placeholder="https://forms.google.com/..."
                          />
                        ) : null}
                        {showFullEventFields ? (
                          <TextField
                            name="prizeInfo"
                            label="Ödül Bilgisi"
                            placeholder="1.ye laptop, 2.ye tablet..."
                          />
                        ) : null}
                      </div>
                      <div className="mt-4">
                        <Textarea
                          name="description"
                          label="Açıklama"
                          rows={4}
                          placeholder="Etkinlik hakkında detaylı bilgi..."
                        />
                      </div>
                    </div>

                    <div className="border-dark-200 border-t pt-5">
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Tarih ve Zaman</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                        <DatePicker name="endDate" label="Bitiş Tarihi" />
                      </div>
                    </div>

                    <div className="border-dark-200 border-t pt-5">
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Ek Bilgiler</h3>
                      <div className="space-y-4">
                        {showFullEventFields ? (
                          <TextField
                            name="linkedin"
                            label="LinkedIn URL"
                            type="url"
                            placeholder="https://www.linkedin.com/events/..."
                          />
                        ) : null}
                        {event.coverImageUrl && (
                          <div>
                            <label className="text-dark mb-1 block text-sm font-medium">
                              Mevcut Kapak
                            </label>
                            <img
                              src={event.coverImageUrl}
                              alt="Mevcut Kapak"
                              className="h-24 w-40 rounded border object-cover"
                            />
                          </div>
                        )}
                        <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                      </div>
                    </div>
                  </div>
                  <FormActions
                    cancel={
                      <Button href={`/events/${id}`} variant="outlineDanger">
                        İptal
                      </Button>
                    }
                    submit={
                      <Button type="submit" variant="outlineBrand" disabled={isPending}>
                        {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                      </Button>
                    }
                  />
                </>
              );
            }}
          </Form>
        </div>
      </div>

      {canDeleteThisEvent ? (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Etkinliği Sil"
        >
          <p>
            <strong>{event.name}</strong> etkinliğini silmek istediğinizden emin misiniz? Bu işlem
            geri alınamaz.
          </p>
          <ModalDangerActions
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            isPending={isDeleting}
          />
        </Modal>
      ) : null}
    </div>
  );
}
