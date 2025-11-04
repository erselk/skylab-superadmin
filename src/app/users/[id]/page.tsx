import { AppShell } from '@/components/layout/AppShell';
import { getUserById } from './actions';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUserById(params.id);

  if (!user) {
    notFound();
  }

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-bold mb-6">Kullanıcı Detayı</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Ad</label>
              <p className="text-lg">{user.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Soyad</label>
              <p className="text-lg">{user.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kullanıcı Adı</label>
              <p className="text-lg">{user.username}</p>
            </div>
            {user.linkedin && (
              <div>
                <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                <p className="text-lg">{user.linkedin}</p>
              </div>
            )}
            {user.university && (
              <div>
                <label className="text-sm font-medium text-gray-500">Üniversite</label>
                <p className="text-lg">{user.university}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Roller</label>
              <p className="text-lg">{user.roles.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

