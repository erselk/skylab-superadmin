import { AppShell } from '@/components/layout/AppShell';
import { getUsers } from './actions';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { UserDto } from '@/types/api';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kullanıcılar</h1>
          <Link href="/users/new">
            <Button>Yeni Kullanıcı</Button>
          </Link>
        </div>

        <DataTable<UserDto>
          data={users}
          columns={[
            { key: 'firstName', header: 'Ad' },
            { key: 'lastName', header: 'Soyad' },
            { key: 'email', header: 'Email' },
            { key: 'username', header: 'Kullanıcı Adı' },
            {
              key: 'roles',
              header: 'Roller',
              render: (roles: string[]) => roles.join(', '),
            },
          ]}
          getId={(user) => user.id}
          onEdit={(user) => {
            // Edit action
          }}
          onDelete={(user) => {
            // Delete action
          }}
        />
      </div>
    </AppShell>
  );
}

