'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CompetitorDto } from '@/types/api';
import { competitorsApi } from '@/lib/api/competitors';

export default function CompetitorsPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);

  const loadCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await competitorsApi.getAll({ includeUser: true, includeEvent: true });
      if (response.success && response.data) {
        setCompetitors(response.data);
      } else {
        setError(response.message || 'Yarışmacılar yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Yarışmacılar yüklenirken hata oluştu';
      // 403 hatası için özel mesaj
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.');
      } else {
        setError(errorMessage);
      }
      console.error('Competitors page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  const handleEdit = (competitor: CompetitorDto) => {
    router.push(`/competitors/${competitor.id}/edit`);
  };

  const handleDelete = (competitor: CompetitorDto) => {
    setSelectedCompetitorId(competitor.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCompetitorId) {
      try {
        await competitorsApi.delete(selectedCompetitorId);
        loadCompetitors();
        setShowDeleteModal(false);
        setSelectedCompetitorId(null);
      } catch (err) {
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete competitor error:', err);
      }
    }
  };

  // Format data for display
  const formattedCompetitors = competitors.map(competitor => ({
    ...competitor,
    userName: competitor.user ? `${competitor.user.firstName} ${competitor.user.lastName}` : '-',
    eventName: competitor.event?.name || '-',
    winnerText: competitor.winner ? 'Evet' : 'Hayır',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Yarışmacılar</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Yarışmacılar</h1>
          <Link href="/competitors/new">
            <Button>Yeni Yarışmacı</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700 mb-4">{error}</p>
            {error.includes('403') || error.includes('yetkiniz') ? (
              <div className="text-sm text-red-600">
                <p className="mb-2">Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.</p>
                <p className="mt-2 text-xs text-gray-600">
                  Bu endpoint için backend SecurityConfig'de izin tanımlanmamış olabilir.
                </p>
                <p className="mt-3">Lütfen yöneticinizle iletişime geçin.</p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            )}
          </div>
        ) : competitors.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz yarışmacı bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedCompetitors}
            columns={[
              { key: 'userName', header: 'Kullanıcı' },
              { key: 'eventName', header: 'Etkinlik' },
              { key: 'points', header: 'Puan' },
              { key: 'winnerText', header: 'Kazanan' },
            ]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            idKey="id"
          />
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Yarışmacıyı Sil"
      >
        <p>Bu yarışmacıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
