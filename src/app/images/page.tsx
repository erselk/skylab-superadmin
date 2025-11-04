'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { FileUpload } from '@/components/forms/FileUpload';
import { Form } from '@/components/forms/Form';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { imagesApi } from '@/lib/api/images';

const uploadSchema = z.object({
  image: z.instanceof(File),
});

export default function ImagesPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (data: z.infer<typeof uploadSchema>) => {
    setUploading(true);
    try {
      await imagesApi.upload(data.image);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Resim Yükle</h1>
        <Form schema={uploadSchema} onSubmit={handleSubmit}>
          {(methods) => (
            <>
              <FileUpload name="image" label="Resim" accept="image/*" required />
              <div className="mt-6">
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Yükleniyor...' : 'Yükle'}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppShell>
  );
}

