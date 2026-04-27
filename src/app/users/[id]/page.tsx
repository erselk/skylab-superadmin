'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { usersApi } from '@/lib/api/users';
import type { UpdateUserRequest, UserDto } from '@/types/api';
import { ALLOWED_ROLES } from '@/config/roles';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles] = useState<string[]>(ALLOWED_ROLES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editData, setEditData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    linkedin: '',
    university: '',
    faculty: '',
    department: '',
    skyNumber: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteData, setPromoteData] = useState({
    targetRole: 'USER',
    initialPassword: '',
  });
  const [isPromoting, setIsPromoting] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getById(id);
      if (response.success && response.data) {
        setUser(response.data);
        setEditData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          linkedin: response.data.linkedin || '',
          university: response.data.university || '',
          faculty: response.data.faculty || '',
          department: response.data.department || '',
          skyNumber: response.data.skyNumber || '',
        });
      } else {
        setError('Kullanıcı bulunamadı');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı yüklenirken hata oluştu');
      console.error('User fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await usersApi.update(user.id, editData);
      router.back();
    } catch (err) {
      alert(
        'Kullanıcı güncellenirken hata oluştu: ' +
          (err instanceof Error ? err.message : 'Bilinmeyen hata'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromote = async () => {
    if (!user || !promoteData.initialPassword) {
      alert('Lütfen başlangıç şifresini giriniz.');
      return;
    }
    setIsPromoting(true);
    try {
      const response = await usersApi.promote(user.id, {
        targetRole: promoteData.targetRole,
        initialPassword: promoteData.initialPassword,
      });
      if (response.success) {
        alert("Kullanıcı başarıyla LDAP'a terfi ettirildi.");
        setIsPromoteModalOpen(false);
        loadUser(); // Veriyi yenile
      } else {
        alert('Terfi işlemi başarısız: ' + response.message);
      }
    } catch (err) {
      alert('Hata: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    } finally {
      setIsPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="border-brand-200 border-t-brand mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4"></div>
            <p className="text-dark-600 font-medium">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="bg-light border-danger rounded-xl border-l-4 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="bg-danger-100 flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  className="text-danger-700 h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-danger-800 mb-2 text-lg font-semibold">Hata</h2>
              <p className="text-dark-700 mb-4">{error || 'Kullanıcı bulunamadı'}</p>
              <Button href="/users" variant="secondary" className="mt-4">
                Geri Dön
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // const availableRolesToAdd = AVAILABLE_ROLES.filter(role => !user.roles.includes(role));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcı Düzenle"
        description={`${user.firstName} ${user.lastName} - ${user.email}`}
        actions={
          <div className="flex gap-2">
            {!user.ldapUser && (
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(true)}
                className="border-brand text-brand hover:bg-brand cursor-pointer rounded-md border bg-transparent px-4 py-2 font-medium transition-colors hover:text-white"
              >
                Terfi Ettir (LDAP)
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                if (!user) return;
                if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
                setIsProcessing(true);
                try {
                  await usersApi.delete(user.id);
                  router.push('/users');
                } catch (err) {
                  alert('Kullanıcı silinirken hata oluştu');
                } finally {
                  setIsProcessing(false);
                }
              }}
              className="text-light cursor-pointer rounded-md bg-red-500 px-4 py-2 font-medium transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
            >
              Sil
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <div className="space-y-5">
            {/* Temel Bilgiler */}
            <div>
              <h3 className="text-dark-800 mb-3 text-sm font-semibold">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Ad</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.firstName || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Soyad</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.lastName || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Email</label>
                  <input
                    disabled
                    className="border-dark-200 bg-dark-50 text-dark-500 w-full cursor-not-allowed rounded-md border px-3 py-2"
                    value={user.email || ''}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Kullanıcı Adı</label>
                  <input
                    disabled
                    className="border-dark-200 bg-dark-50 text-dark-500 w-full cursor-not-allowed rounded-md border px-3 py-2"
                    value={user.username || ''}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Ek Bilgiler */}
            <div className="border-dark-200 border-t pt-5">
              <h3 className="text-dark-800 mb-3 text-sm font-semibold">Ek Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">LinkedIn</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.linkedin || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, linkedin: e.target.value }))}
                    placeholder="https://www.linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Üniversite</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.university || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, university: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Fakülte</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.faculty || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, faculty: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Bölüm</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.department || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, department: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Sky Number</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.skyNumber || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, skyNumber: e.target.value }))}
                    placeholder="S-123456"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-dark-200 flex items-center justify-between gap-3 border-t pt-5">
              <Button
                href="/users"
                variant="secondary"
                className="border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="!text-brand hover:!bg-brand border-brand !bg-transparent hover:!text-white"
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        title="LDAP'a Terfi Ettir"
      >
        <div className="space-y-4">
          <p className="text-dark-600 text-sm">
            Kullanıcıyı kurumsal LDAP sistemine aktararak resmi üye statüsüne geçireceksiniz.
          </p>
          <div>
            <label className="text-dark mb-1 block text-sm font-medium">Hedef Rol</label>
            <select
              className="border-dark-200 bg-light-50 text-dark focus:ring-brand w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              value={promoteData.targetRole}
              onChange={(e) => setPromoteData((d) => ({ ...d, targetRole: e.target.value }))}
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-dark mb-1 block text-sm font-medium">Başlangıç Şifresi</label>
            <input
              type="password"
              className="border-dark-200 bg-light-50 text-dark focus:ring-brand w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="En az 8 karakter"
              value={promoteData.initialPassword}
              onChange={(e) => setPromoteData((d) => ({ ...d, initialPassword: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsPromoteModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handlePromote} disabled={isPromoting}>
              {isPromoting ? 'İşleniyor...' : 'Terfi Ettir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
