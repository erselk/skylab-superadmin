'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { ModalDangerActions } from '@/components/ui/modal-actions';
import { z } from 'zod';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventTypeDto, UserDto } from '@/types/api';

import { Modal } from '@/components/ui/Modal';
import { HiOutlineTrash } from 'react-icons/hi2';

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
});

const coordinatorsCache = new Map<string, UserDto[]>();

function CoordinatorsList({ eventTypeName }: { eventTypeName: string }) {
  const cached = coordinatorsCache.get(eventTypeName) || [];
  const [coordinators, setCoordinators] = useState<UserDto[]>(cached);
  const [loading, setLoading] = useState(cached.length === 0);

  useEffect(() => {
    const cachedCoordinators = coordinatorsCache.get(eventTypeName);
    if (cachedCoordinators) {
      setCoordinators(cachedCoordinators);
      setLoading(false);
      return;
    }

    eventTypesApi
      .getCoordinators(eventTypeName)
      .then((res) => {
        if (res.success && res.data) {
          // data is UserDto[]
          setCoordinators(res.data);
          coordinatorsCache.set(eventTypeName, res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [eventTypeName]);

  if (loading) return <div className="text-dark-500 text-sm">Yükleniyor...</div>;

  if (coordinators.length === 0) {
    return <div className="text-dark-500 text-sm italic">Atanmış koordinatör bulunmuyor.</div>;
  }

  return (
    <ul className="space-y-2">
      {coordinators.map((user) => (
        <li key={user.id} className="bg-light border-dark-100 rounded-md border p-3">
          <div className="text-dark-900 text-sm font-medium">
            {user.firstName} {user.lastName}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function EditEventTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [eventType, setEventType] = useState<EventTypeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      eventTypesApi
        .getById(id)
        .then((response) => {
          if (response.success && response.data) {
            setEventType(response.data);
          } else {
            setError('Etkinlik tipi bulunamadı');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Event type fetch error:', err);
          setError('Etkinlik tipi yüklenirken hata oluştu');
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof eventTypeSchema>) => {
    startTransition(async () => {
      try {
        await eventTypesApi.update(id, {
          name: data.name,
        });
        router.push('/event-types');
      } catch (error) {
        console.error('Event type update error:', error);
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await eventTypesApi.delete(id);
      if (response.success) {
        router.push('/event-types');
      } else {
        console.error('Delete failed:', response);
      }
    } catch (error) {
      console.error('Delete error:', error);
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

  if (error || !eventType) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Etkinlik tipi bulunamadı'}</p>
          <Button href="/event-types" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlik Tipi Düzenle"
        description={eventType.name}
        actions={
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center !border-0 !bg-transparent !px-3 !py-3 hover:!bg-transparent"
            aria-label="Etkinlik tipini sil"
          >
            <HiOutlineTrash className="text-danger h-5 w-5" />
          </Button>
        }
      />

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start">
        <Form
          schema={eventTypeSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            name: eventType.name,
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
                <div className="space-y-4">
                  <TextField name="name" label="Ad" required placeholder="Workshop, Seminer, vb." />
                </div>
                <FormActions
                  cancel={
                    <Button href="/event-types" variant="outlineDanger">
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

        <aside className="bg-light border-dark-200 rounded-lg border p-4 shadow-sm">
          <h3 className="text-dark-800 mb-4 text-base font-semibold">Koordinatörler</h3>
          <CoordinatorsList eventTypeName={eventType.name} />
        </aside>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Etkinlik Tipini Sil"
      >
        <p>
          <strong>{eventType.name}</strong> etkinlik tipini silmek istediğinizden emin misiniz? Bu
          işlem geri alınamaz.
        </p>
        <ModalDangerActions
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isPending={isDeleting}
        />
      </Modal>
    </div>
  );
}
