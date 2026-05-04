'use client';

import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { eventsApi } from '@/lib/api/events';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function ImagesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; name?: string; id?: string }[]>([]);
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name?: string;
    id?: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getAll();
      const list = (res.data || []).flatMap((ev) => {
        const fromCover = ev.coverImageUrl
          ? [{ url: ev.coverImageUrl, name: `${ev.name} - kapak` }]
          : [];
        const fromImages = (ev.imageUrls || []).map((u) => ({ url: u, name: ev.name }));
        return [...fromCover, ...fromImages];
      });
      const combined = [...list];
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
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Resimler" />

        {error && (
          <div className="bg-light border-dark-200 text-dark mb-6 rounded-lg border p-4">
            {error}
          </div>
        )}

        <div className="bg-light border-dark-200 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-dark-600 text-sm">Toplam Görsel</p>
            <p className="text-brand text-2xl font-semibold">{totalCount}</p>
          </div>
          <div className="bg-dark-200/70 hidden h-10 w-px sm:block" />
          <div className="w-full sm:w-1/2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Görsel ara..."
                className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-4 py-2 pl-10 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
              />
              <svg
                className="text-dark-400 absolute top-2.5 left-3 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-dark-400 hover:text-dark-600 absolute top-2.5 right-3"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-dark opacity-60">Yükleniyor...</div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-light border-dark-200 text-dark rounded-lg border p-6 text-center opacity-60">
            Arama kriterlerine uygun görsel bulunamadı.
          </div>
        ) : (
          <div className="columns-1 gap-4 space-y-4 sm:columns-2 xl:columns-4">
            {filteredImages.map((img) => (
              <div key={img.url} className="break-inside-avoid">
                <div className="border-dark-200 bg-dark-200 cursor-pointer overflow-hidden rounded-xl border">
                  <img
                    src={img.url}
                    alt={img.name || 'image'}
                    className="block max-h-80 w-full cursor-pointer object-cover"
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
            <div className="border-dark-200 overflow-hidden rounded-lg border">
              <img
                src={previewImage.url}
                alt={previewImage.name || 'Preview'}
                className="h-auto max-h-[60vh] w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="text-dark-700 break-all">
                <span className="font-medium">Bağlantı: </span>
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand hover:underline"
                >
                  {previewImage.url}
                </a>
              </div>
              <div className="text-dark-500">Kaynak: Etkinlik</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2" />
              <div className="flex items-center gap-2">
                <Button onClick={() => handleDownload(previewImage.url)}>İndir</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
