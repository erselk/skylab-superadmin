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

function recipientFromUser(user: UserDto | null): string {
  const full = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  if (full) return full;
  if (user?.username) return user.username;
  return 'Oyuncu';
}

function fireVictoryConfetti() {
  const colors = ['#27a68e', '#923eb9', '#fde68a', '#ffffff', '#1a1a1a'];
  const fire = (p: Parameters<typeof confetti>[0]) => {
    void confetti(p);
  };
  fire({ particleCount: 130, spread: 78, origin: { y: 0.58 }, colors, scalar: 1.05 });
  fire({ particleCount: 45, angle: 58, spread: 62, origin: { x: 0.08, y: 0.68 }, colors });
  fire({ particleCount: 45, angle: 122, spread: 62, origin: { x: 0.92, y: 0.68 }, colors });
  window.setTimeout(() => {
    fire({ particleCount: 70, spread: 95, origin: { y: 0.32 }, colors, ticks: 220, gravity: 0.9 });
  }, 280);
}

export function GameVictoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [payload, setPayload] = useState<VictoryCertificatePayload | null>(null);
  const certificateTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (certificateTimerRef.current) {
        clearTimeout(certificateTimerRef.current);
        certificateTimerRef.current = null;
      }
    },
    [],
  );

  const celebrateVictory = useCallback(
    (opts: CelebrateVictoryOptions) => {
      fireVictoryConfetti();
      if (certificateTimerRef.current) {
        clearTimeout(certificateTimerRef.current);
        certificateTimerRef.current = null;
      }
      certificateTimerRef.current = window.setTimeout(() => {
        certificateTimerRef.current = null;
        const recipientName = opts.recipientOverride?.trim() || recipientFromUser(user ?? null);
        const certId = `EGA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setPayload({
          gameTitle: opts.gameTitle,
          recipientName,
          certId,
          issuedAt: new Date(),
          isSample: !!opts.isSample,
        });
      }, CERTIFICATE_MODAL_DELAY_MS);
    },
    [user],
  );

  const dismiss = useCallback(() => {
    if (certificateTimerRef.current) {
      clearTimeout(certificateTimerRef.current);
      certificateTimerRef.current = null;
    }
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
