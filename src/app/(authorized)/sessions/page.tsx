'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import type { SessionDto } from '@/types/api';
import { sessionsApi } from '@/lib/api/sessions';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionsApi.getAll();
      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        setError(response.message || 'Oturumlar yuklenirken hata olustu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oturumlar yuklenirken hata olustu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Oturumlar" actions={<Button href="/sessions/new">Yeni Oturum</Button>} />

      {loading ? (
        <div className="bg-light border-dark-200 rounded-lg border p-6 text-center text-sm">
          Yukleniyor...
        </div>
      ) : error ? (
        <div className="bg-light border-danger rounded-lg border p-6">
          <p className="font-medium">Hata olustu</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-light border-dark-200 rounded-lg border p-6 text-center text-sm opacity-70">
          Henuz oturum bulunmuyor.
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-light border-dark-200 block rounded-md border p-3 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-dark-900 truncate text-sm font-medium">{session.title}</div>
                  <div className="text-dark-600 truncate text-xs">
                    {session.event?.name || '-'} •{' '}
                    {session.startTime ? new Date(session.startTime).toLocaleString('tr-TR') : '-'}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {session.event?.id && (
                    <Button
                      href={`/sessions/${session.id}/edit?eventId=${session.event.id}`}
                      variant="secondary"
                      className="!px-2 !py-1 text-xs"
                    >
                      Düzenle
                    </Button>
                  )}
                  {session.sessionType && (
                    <span className="bg-dark-100 text-dark-600 border-dark-200/50 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      {session.sessionType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
