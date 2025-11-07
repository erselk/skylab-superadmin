'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { eventsApi } from '@/lib/api/events';
import { imagesApi } from '@/lib/api/images';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

export default function ImagesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; name?: string; id?: string }[]>([]);
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState<{ url: string; name?: string; id?: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getAll({ includeImages: true });
      const list = (res.data || []).flatMap((ev) => {
        const fromCover = ev.coverImageUrl ? [{ url: ev.coverImageUrl, name: `${ev.name} - kapak` }] : [];
        const fromImages = (ev.imageUrls || []).map((u) => ({ url: u, name: ev.name }));
        return [...fromCover, ...fromImages];
      });
      // LocalStorage'dan yüklenen görselleri ekle
      let uploaded: { url: string; name?: string; id?: string }[] = [];
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('uploaded_images') : null;
        if (raw) {
          const parsed: { id: string; fileUrl: string; fileName: string }[] = JSON.parse(raw);
          uploaded = parsed.map((p) => ({ url: p.fileUrl, name: p.fileName, id: p.id }));
        }
      } catch {}
      const combined = [...uploaded, ...list];
      // URL'e göre tekrarlı olanları kaldır
      const seen = new Set<string>();
      const unique = combined.filter((it) => {
        if (seen.has(it.url)) return false;
        seen.add(it.url);
        return true;
      });
      setImages(unique);
    } catch (e: any) {
      setError(e?.message || 'Görseller yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string, url?: string) => {
    if (!id) return; // yalnızca bizim yüklediklerimizi silebiliriz
    const ok = window.confirm('Bu resmi silmek istediğinize emin misiniz?');
    if (!ok) return;
    try {
      await imagesApi.delete(id);
      try {
        const raw = localStorage.getItem('uploaded_images');
        if (raw) {
          const parsed: { id: string; fileUrl: string; fileName: string }[] = JSON.parse(raw);
          const next = parsed.filter((p) => p.id !== id && p.fileUrl !== url);
          localStorage.setItem('uploaded_images', JSON.stringify(next));
        }
      } catch {}
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (e) {
      alert('Silme işlemi başarısız');
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1500);
    } catch (err) {
      alert('Bağlantı kopyalanamadı');
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop() || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('İndirme başlatılamadı');
    }
  };

  useEffect(() => {
    void loadImages();
  }, []);

  const filteredImages = useMemo(() => {
    if (!search.trim()) return images;
    const query = search.trim().toLowerCase();
    return images.filter((image) => {
      const name = image.name?.toLowerCase() ?? '';
      return name.includes(query) || image.url.toLowerCase().includes(query);
    });
  }, [images, search]);

  const totalCount = images.length;
  const uploadedCount = images.filter((img) => Boolean(img.id)).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Resimler"
          description="Yüklenen tüm görselleri görüntüleyin ve yönetin"
          actions={(
            <Link href="/images/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Resim
                </span>
              </Button>
            </Link>
          )}
        />

        {error && (
          <div className="bg-light border border-dark-200 rounded-lg p-4 mb-6 text-dark">
            {error}
          </div>
        )}

        <div className="bg-light border border-dark-200 rounded-lg p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-dark-600">Toplam Görsel</p>
            <p className="text-2xl font-semibold text-brand">{totalCount}</p>
          </div>
          <div className="hidden h-10 w-px bg-dark-200/70 sm:block" />
          <div>
            <p className="text-sm text-dark-600">Panel Üzerinden Yüklenenler</p>
            <p className="text-2xl font-semibold text-brand">{uploadedCount}</p>
          </div>
          <div className="hidden h-10 w-px bg-dark-200/70 sm:block" />
          <div className="w-full sm:w-1/2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Görsel ara..."
                className="w-full px-4 py-2 pl-10 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50 text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-dark-400 hover:text-dark-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-dark opacity-60">Yükleniyor...</div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center text-dark opacity-60">
            Arama kriterlerine uygun görsel bulunamadı.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 xl:columns-4 gap-4 space-y-4">
            {filteredImages.map((img) => (
              <div key={img.url} className="break-inside-avoid">
                <div className="overflow-hidden rounded-xl border border-dark-200 bg-dark-200 cursor-pointer">
                  <img
                    src={img.url}
                    alt={img.name || 'image'}
                    className="w-full object-cover block max-h-80"
                    loading="lazy"
                    onClick={() => setPreviewImage({ url: img.url, name: img.name, id: img.id })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
        title={previewImage?.name || 'Görsel Önizleme'}
      >
        {previewImage && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-dark-200">
              <img
                src={previewImage.url}
                alt={previewImage.name || 'Preview'}
                className="w-full h-auto object-contain max-h-[60vh]"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="text-dark-700 break-all">
                <span className="font-medium">Bağlantı: </span>
                <a href={previewImage.url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                  {previewImage.url}
                </a>
              </div>
              <div className="text-dark-500">
                Kaynak: {previewImage.id ? 'Panel Yüklemesi' : 'Etkinlik'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                {previewImage.id && (
                  <Button variant="danger" onClick={() => { handleDelete(previewImage.id, previewImage.url); setPreviewImage(null); }}>
                    Sil
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleDownload(previewImage.url)}>İndir</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}





