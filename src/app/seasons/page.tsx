import { AppShell } from '@/components/layout/AppShell';
import { getSeasons } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { SeasonDto } from '@/types/api';

export default async function SeasonsPage() {
  const seasons = await getSeasons();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sezonlar</h1>
          <Link href="/seasons/new">
            <Button>Yeni Sezon</Button>
          </Link>
        </div>

        <DataTable<SeasonDto>
          data={seasons}
          columns={[
            { key: 'name', header: 'Ad' },
            {
              key: 'startDate',
              header: 'Başlangıç',
              render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
            },
            {
              key: 'endDate',
              header: 'Bitiş',
              render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
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
          getId={(season) => season.id}
        />
      </div>
    </AppShell>
  );
}

