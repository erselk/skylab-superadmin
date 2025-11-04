import { AppShell } from '@/components/layout/AppShell';
import { getAnnouncements } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { AnnouncementDto } from '@/types/api';

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Duyurular</h1>
          <Link href="/announcements/new">
            <Button>Yeni Duyuru</Button>
          </Link>
        </div>

        <DataTable<AnnouncementDto>
          data={announcements}
          columns={[
            { key: 'title', header: 'Başlık' },
            {
              key: 'body',
              header: 'İçerik',
              render: (body: string) => body.substring(0, 50) + '...',
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
            {
              key: 'eventType.name',
              header: 'Etkinlik Tipi',
            },
          ]}
          getId={(announcement) => announcement.id}
        />
      </div>
    </AppShell>
  );
}

