'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useGameVictory } from '@/components/games/GameVictoryContext';

type Phase = 'idle' | 'wait' | 'ready' | 'result' | 'early';

/** Bu sürenin altındaki geçerli tıklama sertifika için “kazanılmış tur” sayılır (ms). */
const REFLEX_QUALIFYING_MS = 280;

export function ReflexGame() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [ms, setMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const startAt = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebratedThisRound = useRef(false);
  const { celebrateVictory } = useGameVictory();

  const clearWaitTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => () => clearWaitTimer(), []);

  const startRound = useCallback(() => {
    clearWaitTimer();
    celebratedThisRound.current = false;
    setPhase('wait');
    setMs(null);
    const delay = 800 + Math.random() * 2200;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      startAt.current = performance.now();
      setPhase('ready');
    }, delay);
  }, []);

  const onPadClick = () => {
    if (phase === 'wait') {
      clearWaitTimer();
      setPhase('early');
      return;
    }
    if (phase !== 'ready') return;
    const elapsed = Math.round(performance.now() - startAt.current);
    setMs(elapsed);
    setBest((b) => (b === null ? elapsed : Math.min(b, elapsed)));
    setPhase('result');
  };

  useEffect(() => {
    if (
      phase !== 'result' ||
      ms === null ||
      ms > REFLEX_QUALIFYING_MS ||
      celebratedThisRound.current
    ) {
      return;
    }
    celebratedThisRound.current = true;
    celebrateVictory({ gameTitle: 'Reflex' });
  }, [phase, ms, celebrateVictory]);

  const hint =
    phase === 'idle'
      ? 'Tur başlayınca ekran yeşile döner; o zaman mümkün olduğunca hızlı tıkla.'
      : phase === 'wait'
        ? 'Kırmızı bekleyiş… yeşil olur olmaz tıkla. Şimdiden tıklarsan tur iptal.'
        : phase === 'ready'
          ? 'Yeşil — şimdi tıkla!'
          : phase === 'early'
            ? 'Çok erken tıkladın. Tekrar dene.'
            : ms !== null
              ? `Süre: ${ms} ms`
              : '';

  const padClass =
    phase === 'wait' || phase === 'early'
      ? 'cursor-pointer border-red-500 bg-red-500 text-white shadow-inner'
      : phase === 'ready'
        ? 'cursor-pointer border-emerald-600 bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-300/60'
        : phase === 'result' && ms !== null
          ? 'cursor-pointer border-brand bg-brand-50 text-brand-800'
          : 'border-dark-200 bg-dark-100 text-dark-500';

  const padLabel =
    phase === 'early'
      ? 'Çok erken!'
      : phase === 'wait'
        ? 'Bekle…'
        : phase === 'ready'
          ? 'TIKLA!'
          : phase === 'result' && ms !== null
            ? `${ms} ms`
            : '—';

  return (
    <div className="mx-auto flex w-full max-w-md min-w-0 flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Refleks</h3>
      {best !== null && <div className="text-brand text-lg font-semibold">En iyi: {best} ms</div>}
      <p className="text-dark-600 min-h-[3rem] text-center text-sm">{hint}</p>

      {phase === 'idle' ? (
        <div className="border-dark-200 text-dark-500 bg-light-100 flex h-40 w-full max-w-xs cursor-default items-center justify-center rounded-2xl border-4 border-dashed text-center text-sm">
          Aşağıdan turu başlat
        </div>
      ) : (
        <button
          type="button"
          onClick={onPadClick}
          className={`flex h-40 w-full max-w-xs items-center justify-center rounded-2xl border-4 text-xl font-bold transition-colors select-none ${padClass}`}
        >
          {padLabel}
        </button>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {phase === 'idle' ? (
          <Button onClick={startRound}>Tur başlat</Button>
        ) : phase === 'result' || phase === 'early' ? (
          <Button onClick={startRound}>Yeni tur</Button>
        ) : null}
      </div>
    </div>
  );
}
