import { AppShell } from '@/components/layout/AppShell';
import { getCompetitors } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { CompetitorDto } from '@/types/api';

export default async function CompetitorsPage() {
  const competitors = await getCompetitors();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Yarışmacılar</h1>
          <Link href="/competitors/new">
            <Button>Yeni Yarışmacı</Button>
          </Link>
        </div>

        <DataTable<CompetitorDto>
          data={competitors}
          columns={[
            {
              key: 'user',
              header: 'Kullanıcı',
              render: (user: any) => user ? `${user.firstName} ${user.lastName}` : '-',
            },
            {
              key: 'event.name',
              header: 'Etkinlik',
            },
            { key: 'points', header: 'Puan' },
            {
              key: 'winner',
              header: 'Kazanan',
              render: (winner: boolean) => (
                <span className={winner ? 'text-green-600' : 'text-gray-600'}>
                  {winner ? 'Evet' : 'Hayır'}
                </span>
              ),
            },
          ]}
          getId={(competitor) => competitor.id}
        />
      </div>
    </AppShell>
  );
}

