'use client';

import { useEffect, useState } from 'react';

type ErrorKind = 'backend' | 'frontend' | null;

export function GlobalErrorMessenger() {
  const [visible, setVisible] = useState(false);
  const [kind, setKind] = useState<ErrorKind>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    function classify(message: string | undefined | null): ErrorKind {
      const msg = (message || '').toLowerCase();
      // Backend hatası: HTTP 5xx, 502, Bad Gateway, fetch/network failure, explicit backend marker
      if (
        msg.includes('http 5') ||
        msg.includes(' 500') ||
        msg.includes(' 501') ||
        msg.includes(' 502') ||
        msg.includes(' 503') ||
        msg.includes(' 504') ||
        msg.includes('bad gateway') ||
        msg.includes('backend servisi') ||
        msg.includes('failed to fetch') ||
        msg.includes('networkerror') ||
        msg.includes('network error')
      ) {
        return 'backend';
      }
      return 'frontend';
    }

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason: any = e.reason;
      const message = typeof reason === 'string' ? reason : (reason?.message || reason?.toString?.());
      const k = classify(message);
      setKind(k);
      setLastMessage(message || null);
      setVisible(true);
    };

    const onError = (e: ErrorEvent) => {
      const message = e.message || (e.error && (e.error as Error)?.message) || '';
      const k = classify(message);
      setKind(k);
      setLastMessage(message || null);
      setVisible(true);
    };

    const onCustomFrontend = (e: Event) => {
      // CustomEvent<'frontend-error'> with detail.message
      const ce = e as CustomEvent<{ message?: string }>;
      setKind('frontend');
      setLastMessage(ce.detail?.message || null);
      setVisible(true);
    };

    const onCustomBackend = (e: Event) => {
      const ce = e as CustomEvent<{ message?: string }>;
      setKind('backend');
      setLastMessage(ce.detail?.message || null);
      setVisible(true);
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError);
    window.addEventListener('frontend-error', onCustomFrontend as EventListener);
    window.addEventListener('backend-error', onCustomBackend as EventListener);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError);
      window.removeEventListener('frontend-error', onCustomFrontend as EventListener);
      window.removeEventListener('backend-error', onCustomBackend as EventListener);
    };
  }, []);

  if (!visible || !kind) return null;

  const isBackend = kind === 'backend';

  return (
    <div className="mb-6 bg-light border border-dark-200 rounded-lg p-4 text-dark">
      <div className="flex items-start gap-3">
        <div className="text-dark">{isBackend ? '⚠️' : '🐞'}</div>
        <div className="flex-1">
          {isBackend ? (
            <>
              <div className="font-semibold">Backend sorunu tespit edildi.</div>
              <div className="text-sm">
                Lütfen hemen backend developerı açana kadar arayın.
                <a href="tel:+905524913525" className="block font-medium hover:underline">
                  <span className="block">Yusuf Açmacı</span>
                  +90 552 491 35 25
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="font-semibold">Frontend sorunu tespit edildi.</div>
              <div className="text-sm">
                Lütfen 15.00-23.00 arasında frontend developera WhatsApp üzerinden haber verin.
                <a href="tel:+905050067111" className="block font-medium hover:underline">
                  <span className="block">Yusuf Ersel Kara</span>
                  +90 505 006 71 11
                </a>
              </div>
            </>
          )}
          {lastMessage ? (
            <div className="text-xs opacity-70 mt-1">Detay: {lastMessage}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


