import { AppShell } from '@/components/layout/AppShell';
import { getSessions } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { SessionDto } from '@/types/api';

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Oturumlar</h1>
          <Link href="/sessions/new">
            <Button>Yeni Oturum</Button>
          </Link>
        </div>

        <DataTable<SessionDto>
          data={sessions}
          columns={[
            { key: 'title', header: 'Başlık' },
            { key: 'speakerName', header: 'Konuşmacı' },
            {
              key: 'startTime',
              header: 'Başlangıç',
              render: (date: string) => new Date(date).toLocaleString('tr-TR'),
            },
            {
              key: 'endTime',
              header: 'Bitiş',
              render: (date: string) => date ? new Date(date).toLocaleString('tr-TR') : '-',
            },
            { key: 'sessionType', header: 'Tip' },
          ]}
          getId={(session) => session.id}
        />
      </div>
    </AppShell>
  );
}

