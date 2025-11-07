'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AnnouncementDto } from '@/types/api';
import { announcementsApi } from '@/lib/api/announcements';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await announcementsApi.getAll({ includeEventType: true });
      if (response.success && response.data) {
        setAnnouncements(response.data);
      } else {
        setError(response.message || 'Duyurular yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyurular yüklenirken hata oluştu');
      console.error('Announcements page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleEdit = (announcement: AnnouncementDto) => {
    router.push(`/announcements/${announcement.id}/edit`);
  };

  const handleDelete = (announcement: AnnouncementDto) => {
    setSelectedAnnouncementId(announcement.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedAnnouncementId) {
      try {
        await announcementsApi.delete(selectedAnnouncementId);
        loadAnnouncements();
        setShowDeleteModal(false);
        setSelectedAnnouncementId(null);
      } catch (err) {
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete announcement error:', err);
      }
    }
  };

  // Format data for display
  const formattedAnnouncements = announcements.map(announcement => ({
    ...announcement,
    bodyPreview: announcement.body ? announcement.body.substring(0, 50) + '...' : '',
    statusText: announcement.active ? 'Aktif' : 'Pasif',
    eventTypeName: announcement.eventType?.name || '-',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Duyurular</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Duyurular"
          description="Duyuruları görüntüleyin ve yönetin"
          actions={(
            <Link href="/announcements/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Duyuru
                </span>
              </Button>
            </Link>
          )}
        />
        {announcements.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center">
            <p className="text-dark opacity-60">Henüz duyuru bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                onClick={() => handleEdit(a)}
                className="bg-light border border-dark-200 rounded-md p-3 hover:bg-brand-50 hover:border-brand transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-dark-900 truncate">{a.title}</div>
                    <div className="text-xs text-dark-600 truncate">{a.eventType?.name || '-'} • {(a.body || '').slice(0, 60)}{(a.body || '').length > 60 ? '…' : ''}</div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${a.active ? 'bg-brand-100 text-brand-700 border-brand-200/50' : 'bg-dark-100 text-dark-600 border-dark-200/50'}`}>{a.active ? 'Aktif' : 'Pasif'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Duyuruyu Sil"
      >
        <p>Bu duyuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
