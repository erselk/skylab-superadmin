'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { z } from 'zod';
import { eventTypesApi } from '@/lib/api/event-types';

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
});

export default function NewEventTypePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: z.infer<typeof eventTypeSchema>) => {
    startTransition(async () => {
      try {
        await eventTypesApi.create({
          name: data.name,
        });
        router.push('/event-types');
      } catch (error) {
        console.error('Event type creation error:', error);
        alert(
          'Etkinlik tipi oluşturulurken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Etkinlik Tipi" />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form schema={eventTypeSchema} onSubmit={handleSubmit} defaultValues={{ name: '' }}>
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
                      <TextField
                        name="name"
                        label="Ad"
                        required
                        placeholder="Workshop, Seminer, vb."
                      />
                    </div>
                  </div>

                  <FormActions
                    cancel={
                      <Button href="/event-types" variant="outlineDanger">
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
              );
            }}
          </Form>
        </div>
      </div>
    </div>
  );
}
