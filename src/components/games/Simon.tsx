'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

const PADS = [
  { id: 0, label: 'Kırmızı', bg: 'bg-red-500', glow: 'ring-red-300' },
  { id: 1, label: 'Mavi', bg: 'bg-blue-600', glow: 'ring-blue-300' },
  { id: 2, label: 'Yeşil', bg: 'bg-green-600', glow: 'ring-green-300' },
  { id: 3, label: 'Sarı', bg: 'bg-yellow-400', glow: 'ring-yellow-200' },
] as const;

type Phase = 'idle' | 'showing' | 'input' | 'won' | 'lost' | 'between';

export function SimonGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [inputIndex, setInputIndex] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sequenceRef = useRef<number[]>([]);

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const enqueue = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
  }, []);

  const playSequence = useCallback(
    (seq: number[]) => {
      setPhase('showing');
      setHighlight(null);
      let delay = 0;
      seq.forEach((pad, i) => {
        enqueue(() => setHighlight(pad), delay);
        delay += 380;
        enqueue(() => setHighlight(null), delay);
        delay += 140;
      });
      enqueue(() => {
        setPhase('input');
        setInputIndex(0);
        setHighlight(null);
      }, delay + 80);
    },
    [enqueue],
  );

  const startRound = useCallback(() => {
    clearTimers();
    setPhase('showing');
    setHighlight(null);
    const prev = sequenceRef.current;
    const nextPad = Math.floor(Math.random() * 4);
    const nextSeq = [...prev, nextPad];
    setSequence(nextSeq);
    setLevel(nextSeq.length);
    enqueue(() => playSequence(nextSeq), 320);
  }, [clearTimers, enqueue, playSequence]);

  const beginGame = () => {
    clearTimers();
    setSequence([]);
    sequenceRef.current = [];
    setLevel(0);
    setInputIndex(0);
    setPhase('idle');
    enqueue(() => {
      const first = Math.floor(Math.random() * 4);
      const seq = [first];
      sequenceRef.current = seq;
      setSequence(seq);
      setLevel(1);
      playSequence(seq);
    }, 120);
  };

  const onPadPress = (id: number) => {
    if (phase !== 'input') return;

    const expected = sequence[inputIndex];
    if (id !== expected) {
      setPhase('lost');
      setHighlight(id);
      enqueue(() => setHighlight(null), 200);
      return;
    }

    const nextIdx = inputIndex + 1;
    if (nextIdx >= sequence.length) {
      if (sequence.length >= 15) {
        setPhase('won');
        return;
      }
      setPhase('between');
      enqueue(() => startRound(), 500);
      return;
    }

    setInputIndex(nextIdx);
  };

  const statusText =
    phase === 'idle' && sequence.length === 0
      ? 'Diziyi tekrarla; her doğru turda sekans uzar.'
      : phase === 'showing'
        ? 'Dikkat!'
        : phase === 'between'
          ? 'Sonraki tur geliyor…'
          : phase === 'input'
            ? `Sıra sizde (${inputIndex + 1}/${sequence.length})`
            : phase === 'won'
              ? 'Tebrikler! 15 turu tamamladınız.'
              : phase === 'lost'
                ? 'Yanlış! Tekrar başlamak için aşağıya basın.'
                : '';

  return (
    <div className="mx-auto flex w-full max-w-lg min-w-0 flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Simon</h3>
      <div className="text-brand text-lg font-semibold">Tur: {level}</div>
      <p className="text-dark-600 min-h-[2.5rem] text-center text-sm">{statusText}</p>

      <div className="grid w-full max-w-[min(100%,280px)] grid-cols-2 gap-3">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            aria-label={pad.label}
            disabled={phase !== 'input'}
            onClick={() => onPadPress(pad.id)}
            className={`${pad.bg} aspect-square rounded-xl opacity-90 ring-4 ring-transparent transition-all hover:opacity-100 disabled:pointer-events-none ${
              highlight === pad.id ? `scale-105 opacity-100 ring-offset-2 ${pad.glow}` : ''
            } `}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {sequence.length === 0 || phase === 'won' ? (
          <Button onClick={beginGame}>{phase === 'won' ? 'Yeni oyun' : 'Başla'}</Button>
        ) : phase === 'lost' ? (
          <Button onClick={beginGame}>Tekrar başla</Button>
        ) : null}
      </div>

      <p className="text-dark-500 text-center text-xs">
        Önce diziyi izleyin, sonra aynı sırayla padlara basın.
      </p>
    </div>
  );
}
