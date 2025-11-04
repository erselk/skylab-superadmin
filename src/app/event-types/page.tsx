import { AppShell } from '@/components/layout/AppShell';
import { getEventTypes } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { EventTypeDto } from '@/types/api';

export default async function EventTypesPage() {
  const eventTypes = await getEventTypes();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Etkinlik Tipleri</h1>
          <Link href="/event-types/new">
            <Button>Yeni Etkinlik Tipi</Button>
          </Link>
        </div>

        <DataTable<EventTypeDto>
          data={eventTypes}
          columns={[
            { key: 'name', header: 'Ad' },
          ]}
          getId={(et) => et.id}
        />
      </div>
    </AppShell>
  );
}

