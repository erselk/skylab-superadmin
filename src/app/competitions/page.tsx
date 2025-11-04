import { AppShell } from '@/components/layout/AppShell';
import { getCompetitions } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { CompetitionDto } from '@/types/api';

export default async function CompetitionsPage() {
  const competitions = await getCompetitions();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Yarışmalar</h1>
          <Link href="/competitions/new">
            <Button>Yeni Yarışma</Button>
          </Link>
        </div>

        <DataTable<CompetitionDto>
          data={competitions}
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
          getId={(comp) => comp.id}
        />
      </div>
    </AppShell>
  );
}

