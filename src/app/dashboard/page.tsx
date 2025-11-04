import { AppShell } from '@/components/layout/AppShell';

export default function DashboardPage() {
  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Kullanıcılar</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Yarışmalar</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Etkinlikler</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Duyurular</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">-</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
