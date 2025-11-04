import { AppShell } from '@/components/layout/AppShell';
import { getEvents } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { EventDto } from '@/types/api';

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Etkinlikler</h1>
          <Link href="/events/new">
            <Button>Yeni Etkinlik</Button>
          </Link>
        </div>

        <DataTable<EventDto>
          data={events}
          columns={[
            { key: 'name', header: 'Ad' },
            { key: 'location', header: 'Konum' },
            {
              key: 'startDate',
              header: 'Başlangıç',
              render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
            },
            {
              key: 'type.name',
              header: 'Tip',
            },
            {
              key: 'active',
              header: 'Durum',
              render: (active: boolean) => (
                <span className={active ? 'text-green-600' : 'text-gray-600'}>
                  {active ? 'Aktif' : 'Pasif'}
                </span>
              ),
            },
          ]}
          getId={(event) => event.id}
        />
      </div>
    </AppShell>
  );
}

