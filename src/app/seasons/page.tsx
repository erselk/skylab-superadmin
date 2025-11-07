'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SeasonDto } from '@/types/api';
import { seasonsApi } from '@/lib/api/seasons';

export default function SeasonsPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const loadSeasons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await seasonsApi.getAll();
      if (response.success && response.data) {
        setSeasons(response.data);
      } else {
        setError(response.message || 'Sezonlar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sezonlar yüklenirken hata oluştu');
      console.error('Seasons page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleEdit = (season: SeasonDto) => {
    router.push(`/seasons/${season.id}/edit`);
  };

  const handleDelete = (season: SeasonDto) => {
    setSelectedSeasonId(season.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedSeasonId) {
      try {
        await seasonsApi.delete(selectedSeasonId);
        loadSeasons();
        setShowDeleteModal(false);
        setSelectedSeasonId(null);
      } catch (err) {
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete season error:', err);
      }
    }
  };

  // Format data for display
  const formattedSeasons = seasons.map(season => ({
    ...season,
    startDateFormatted: season.startDate ? new Date(season.startDate).toLocaleDateString('tr-TR') : '',
    endDateFormatted: season.endDate ? new Date(season.endDate).toLocaleDateString('tr-TR') : '',
    statusText: season.active ? 'Aktif' : 'Pasif',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Sezonlar</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Sezonlar"
          description="Sezonları görüntüleyin ve yönetin"
          actions={(
            <Link href="/seasons/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Sezon
                </span>
              </Button>
            </Link>
          )}
        />
        {error ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-brand mb-2">Hata</h2>
            <p className="text-dark mb-4">{error}</p>
          </div>
        ) : seasons.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center">
            <p className="text-dark opacity-60">Henüz sezon bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {seasons.map((s) => (
              <div
                key={s.id}
                onClick={() => handleEdit(s)}
                className="bg-light border border-dark-200 rounded-md p-3 hover:bg-brand-50 hover:border-brand transition cursor-pointer flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-dark-900 truncate">{s.name}</div>
                  <div className="text-xs text-dark-600 truncate">{new Date(s.startDate).toLocaleDateString('tr-TR')} - {s.endDate ? new Date(s.endDate).toLocaleDateString('tr-TR') : '-'}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${s.active ? 'bg-brand-100 text-brand-700 border-brand-200/50' : 'bg-dark-100 text-dark-600 border-dark-200/50'}`}>{s.active ? 'Aktif' : 'Pasif'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Sezonu Sil"
      >
        <p>Bu sezonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
