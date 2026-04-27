'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { mediaApi } from '@/lib/api/media';
import { Modal } from '@/components/ui/Modal';
import {
  HiOutlineDocument,
  HiOutlineClipboard,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
} from 'react-icons/hi2';

export default function MediaPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [mediaList, setMediaList] = useState<
    { id: string; url: string; name: string; type: string; size?: number }[]
  >([]);
  const [previewMedia, setPreviewMedia] = useState<{
    id: string;
    url: string;
    name: string;
    type: string;
    size?: number;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    // LocalStorage'dan geçmişi yükle
    const saved = localStorage.getItem('uploaded_media');
    if (saved) {
      try {
        setMediaList(JSON.parse(saved));
      } catch (e) {
        console.error('Media history load error:', e);
      }
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file);
      if (response.success && response.data) {
        const newItem = {
          id: response.data.id,
          url: response.data.url,
          name: response.data.name || file.name,
          type: response.data.type || file.type,
          size: response.data.size || file.size,
        };
        const newList = [newItem, ...mediaList];
        setMediaList(newList);
        localStorage.setItem('uploaded_media', JSON.stringify(newList));
      } else {
        alert('Yükleme başarısız: ' + response.message);
      }
    } catch (err) {
      alert('Yükleme hatası: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = (id: string) => {
    if (
      !confirm('Bu medya kaydını geçmişten silmek istediğinize emin misiniz? (Sunucudan silinmez)')
    )
      return;
    const newList = mediaList.filter((item) => item.id !== id);
    setMediaList(newList);
    localStorage.setItem('uploaded_media', JSON.stringify(newList));
    if (previewMedia?.id === id) setPreviewMedia(null);
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      alert('Kopyalanamadı');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medya Yönetimi"
        description="Dosya yükleyin ve paylaşılan medya bağlantılarını yönetin"
        actions={
          <div className="relative">
            <input
              type="file"
              id="media-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label htmlFor="media-upload">
              <Button
                as="span"
                className={isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              >
                {isUploading ? 'Yükleniyor...' : 'Dosya Yükle'}
              </Button>
            </label>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mediaList.length === 0 ? (
          <div className="bg-light border-dark-200 col-span-full rounded-xl border border-dashed py-20 text-center">
            <p className="text-dark-500">Henüz bir medya dosyası yüklenmedi.</p>
          </div>
        ) : (
          mediaList.map((item) => (
            <div
              key={item.id}
              className="bg-light border-dark-200 group overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
            >
              <div
                className="bg-dark-50 relative flex aspect-video cursor-pointer items-center justify-center"
                onClick={() => setPreviewMedia(item)}
              >
                {item.type.startsWith('image/') ? (
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <HiOutlineDocument className="text-dark-300 h-12 w-12" />
                )}
                <div className="bg-dark/40 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-medium text-white">Önizle</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-dark truncate text-sm font-medium" title={item.name}>
                  {item.name}
                </p>
                <p className="text-dark-500 mt-1 text-xs">
                  {item.type} • {formatSize(item.size)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url)}
                    className="bg-dark-50 hover:bg-dark-100 text-dark-700 flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-xs transition-colors"
                  >
                    <HiOutlineClipboard className="h-4 w-4" />
                    {copiedUrl === item.url ? 'Kopyalandı!' : 'URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={previewMedia !== null}
        onClose={() => setPreviewMedia(null)}
        title="Medya Önizleme"
      >
        {previewMedia && (
          <div className="space-y-4">
            <div className="bg-dark-50 border-dark-200 flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg border">
              {previewMedia.type.startsWith('image/') ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              ) : previewMedia.type.startsWith('video/') ? (
                <video src={previewMedia.url} controls className="max-h-[60vh] max-w-full" />
              ) : (
                <div className="p-10 text-center">
                  <HiOutlineDocument className="text-dark-300 mx-auto h-20 w-20" />
                  <p className="text-dark-600 mt-2">Bu dosya tipi için önizleme desteklenmiyor.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-dark font-semibold break-all">{previewMedia.name}</p>
              <p className="text-dark-500 text-sm">
                Tip: {previewMedia.type} • Boyut: {formatSize(previewMedia.size)}
              </p>
              <div className="bg-dark-50 border-dark-200 text-brand rounded border p-2 font-mono text-xs break-all">
                {previewMedia.url}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => handleCopy(previewMedia.url)}>
                {copiedUrl === previewMedia.url ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}
              </Button>
              <a
                href={previewMedia.url}
                download={previewMedia.name}
                className="bg-dark-100 hover:bg-dark-200 text-dark-800 flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-center font-medium transition-colors"
              >
                <HiOutlineArrowDownTray className="h-5 w-5" />
                İndir
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
