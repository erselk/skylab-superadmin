'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import confetti from 'canvas-confetti';

import { useAuth } from '@/context/AuthContext';
import type { UserDto } from '@/types/api';

import { VictoryCertificateModal, type VictoryCertificatePayload } from './VictoryCertificateModal';

export type CelebrateVictoryOptions = {
  gameTitle: string;
  /** Örnek / test belgesinde kullanılacak isim */
  recipientOverride?: string;
  /** Üzerinde «Örnek belge» damgası */
  isSample?: boolean;
};

type GameVictoryContextValue = {
  celebrateVictory: (opts: CelebrateVictoryOptions) => void;
};

const GameVictoryContext = createContext<GameVictoryContextValue | null>(null);

const CERTIFICATE_MODAL_DELAY_MS = 3000;

function getCertificateModalDelayMs(): number {
  if (typeof window === 'undefined') return CERTIFICATE_MODAL_DELAY_MS;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  return CERTIFICATE_MODAL_DELAY_MS;
}

function shouldPlayVictoryConfetti(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function recipientFromUser(user: UserDto | null): string {
  const full = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  if (full) return full;
  if (user?.username) return user.username;
  return 'Oyuncu';
}

function nextCertificateId(): string {
  const year = new Date().getFullYear();
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
    return `EGA-${year}-${suffix}`;
  }
  return `EGA-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Gecikmeli konfeti turunu iptal etmek için (unmount / yeni kutlama). */
function fireVictoryConfetti(): () => void {
  const colors = ['#27a68e', '#923eb9', '#fde68a', '#ffffff', '#1a1a1a'];
  void confetti({
    particleCount: 130,
    spread: 78,
    origin: { y: 0.58 },
    colors,
    scalar: 1.05,
  });
  void confetti({
    particleCount: 45,
    angle: 58,
    spread: 62,
    origin: { x: 0.08, y: 0.68 },
    colors,
  });
  void confetti({
    particleCount: 45,
    angle: 122,
    spread: 62,
    origin: { x: 0.92, y: 0.68 },
    colors,
  });
  const tid = window.setTimeout(() => {
    void confetti({
      particleCount: 70,
      spread: 95,
      origin: { y: 0.32 },
      colors,
      ticks: 220,
      gravity: 0.9,
    });
  }, 280);
  return () => clearTimeout(tid);
}

export function GameVictoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [payload, setPayload] = useState<VictoryCertificatePayload | null>(null);
  const certificateTimerRef = useRef<number | null>(null);
  const confettiCleanupRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      if (certificateTimerRef.current) {
        clearTimeout(certificateTimerRef.current);
        certificateTimerRef.current = null;
      }
      confettiCleanupRef.current?.();
      confettiCleanupRef.current = null;
    },
    [],
  );

  const celebrateVictory = useCallback(
    (opts: CelebrateVictoryOptions) => {
      confettiCleanupRef.current?.();
      confettiCleanupRef.current = null;
      if (shouldPlayVictoryConfetti()) {
        confettiCleanupRef.current = fireVictoryConfetti();
      }

      setPayload(null);

      if (certificateTimerRef.current) {
        clearTimeout(certificateTimerRef.current);
        certificateTimerRef.current = null;
      }
      const delayMs = getCertificateModalDelayMs();
      certificateTimerRef.current = window.setTimeout(() => {
        certificateTimerRef.current = null;
        const recipientName = opts.recipientOverride?.trim() || recipientFromUser(user ?? null);
        const certId = nextCertificateId();
        setPayload({
          gameTitle: opts.gameTitle,
          recipientName,
          certId,
          issuedAt: new Date(),
          isSample: !!opts.isSample,
        });
      }, delayMs);
    },
    [user],
  );

  const dismiss = useCallback(() => {
    if (certificateTimerRef.current) {
      clearTimeout(certificateTimerRef.current);
      certificateTimerRef.current = null;
    }
    confettiCleanupRef.current?.();
    confettiCleanupRef.current = null;
    setPayload(null);
  }, []);

  const value = useMemo(() => ({ celebrateVictory }), [celebrateVictory]);

  return (
    <GameVictoryContext.Provider value={value}>
      {children}
      {payload ? <VictoryCertificateModal {...payload} onClose={dismiss} /> : null}
    </GameVictoryContext.Provider>
  );
}

/** Bekleme salonu dışında kullanılırsa no-op döner. */
export function useGameVictory(): GameVictoryContextValue {
  const ctx = useContext(GameVictoryContext);
  if (!ctx) {
    return { celebrateVictory: () => {} };
  }
  return ctx;
}
