'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { useGameVictory } from '@/components/games/GameVictoryContext';

type Hand = 'rock' | 'paper' | 'scissors';

const LABELS: Record<Hand, string> = {
  rock: 'Taş',
  paper: 'Kağıt',
  scissors: 'Makas',
};

const EMOJI: Record<Hand, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

function beats(a: Hand, b: Hand): 'win' | 'lose' | 'draw' {
  if (a === b) return 'draw';
  if (
    (a === 'rock' && b === 'scissors') ||
    (a === 'paper' && b === 'rock') ||
    (a === 'scissors' && b === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
}

function randomHand(): Hand {
  const all: Hand[] = ['rock', 'paper', 'scissors'];
  return all[Math.floor(Math.random() * 3)];
}

export function RockPaperScissorsGame() {
  const [player, setPlayer] = useState<Hand | null>(null);
  const [cpu, setCpu] = useState<Hand | null>(null);
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [last, setLast] = useState<string | null>(null);
  const matchWonRef = useRef(false);
  const { celebrateVictory } = useGameVictory();

  const play = useCallback((choice: Hand) => {
    const c = randomHand();
    setPlayer(choice);
    setCpu(c);
    const r = beats(choice, c);
    if (r === 'win') {
      setScore((s) => ({ ...s, you: s.you + 1 }));
      setLast('Kazandın!');
    } else if (r === 'lose') {
      setScore((s) => ({ ...s, cpu: s.cpu + 1 }));
      setLast('Bilgisayar aldı.');
    } else {
      setLast('Berabere.');
    }
  }, []);

  useEffect(() => {
    if (score.you < 5 || matchWonRef.current) return;
    matchWonRef.current = true;
    celebrateVictory({ gameTitle: 'Rock Paper Scissors (first to 5)' });
  }, [score.you, celebrateVictory]);

  const reset = () => {
    matchWonRef.current = false;
    setPlayer(null);
    setCpu(null);
    setScore({ you: 0, cpu: 0 });
    setLast(null);
  };

  const hands: Hand[] = ['rock', 'paper', 'scissors'];

  return (
    <div className="mx-auto flex w-full max-w-md min-w-0 flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Taş · Kağıt · Makas</h3>
      <div className="text-brand text-lg font-semibold">
        Sen {score.you} — {score.cpu} Bilgisayar
      </div>
      <p className="text-dark-500 text-center text-xs">İlk 5 sayıyı alan kazanır.</p>
      {last && <p className="text-dark-700 text-center text-sm font-medium">{last}</p>}
      {player && cpu && (
        <p className="text-dark-600 text-center text-sm">
          Sen: {EMOJI[player]} {LABELS[player]} · Bilgisayar: {EMOJI[cpu]} {LABELS[cpu]}
        </p>
      )}
      <div className="grid w-full max-w-xs grid-cols-3 gap-2">
        {hands.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => play(h)}
            className="border-dark-200 hover:border-brand hover:bg-brand-50 flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 bg-white py-3 transition-colors"
          >
            <span className="text-3xl">{EMOJI[h]}</span>
            <span className="text-dark-700 text-xs font-medium">{LABELS[h]}</span>
          </button>
        ))}
      </div>
      <Button onClick={reset}>Skoru sıfırla</Button>
    </div>
  );
}
