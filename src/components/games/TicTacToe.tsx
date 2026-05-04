'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { useGameVictory } from '@/components/games/GameVictoryContext';

type Cell = 'X' | 'O' | null;
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winnerOf(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function pickComputerMove(board: Cell[]): number {
  const empty = board.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
  if (empty.length === 0) return -1;
  return empty[Math.floor(Math.random() * empty.length)];
}

export function TicTacToeGame() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [status, setStatus] = useState<'playing' | 'draw' | 'winX' | 'winO'>('playing');
  const [started, setStarted] = useState(false);
  const celebratedWin = useRef(false);
  const { celebrateVictory } = useGameVictory();

  const reset = () => {
    celebratedWin.current = false;
    setBoard(Array(9).fill(null));
    setTurn('X');
    setStatus('playing');
    setStarted(true);
  };

  const playComputer = useCallback((next: Cell[]) => {
    const w = winnerOf(next);
    if (w === 'X') {
      setStatus('winX');
      return;
    }
    if (!next.includes(null)) {
      setStatus('draw');
      return;
    }
    const idx = pickComputerMove(next);
    if (idx < 0) return;
    setTurn('O');
    setTimeout(() => {
      setBoard((prev) => {
        if (winnerOf(prev) || !prev.includes(null)) return prev;
        const copy = [...prev];
        if (copy[idx] !== null) return prev;
        copy[idx] = 'O';
        const ow = winnerOf(copy);
        if (ow === 'O') setStatus('winO');
        else if (!copy.includes(null)) setStatus('draw');
        else setTurn('X');
        return copy;
      });
    }, 350);
  }, []);

  useEffect(() => {
    if (status !== 'winX' || celebratedWin.current) return;
    celebratedWin.current = true;
    celebrateVictory({ gameTitle: 'Tic-Tac-Toe' });
  }, [status, celebrateVictory]);

  const onCellClick = (i: number) => {
    if (!started || status !== 'playing' || turn !== 'X') return;
    if (board[i]) return;

    const next = [...board];
    next[i] = 'X';
    setBoard(next);

    const w = winnerOf(next);
    if (w === 'X') {
      setStatus('winX');
      return;
    }
    if (!next.includes(null)) {
      setStatus('draw');
      return;
    }
    playComputer(next);
  };

  const message = !started
    ? 'Başlamak için aşağıdaki düğmeye basın.'
    : status === 'playing'
      ? turn === 'X'
        ? 'Sıra sizde (X).'
        : 'Bilgisayar düşünüyor (O)...'
      : status === 'draw'
        ? 'Berabere!'
        : status === 'winX'
          ? 'Kazandınız!'
          : 'Bilgisayar kazandı.';

  return (
    <div className="mx-auto flex w-full max-w-lg min-w-0 flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">XOX</h3>
      <p className="text-dark-600 text-center text-sm">{message}</p>

      <div className="grid w-full max-w-[min(100%,260px)] grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            disabled={!started || status !== 'playing' || turn !== 'X' || cell !== null}
            onClick={() => onCellClick(i)}
            className="bg-dark-50 border-dark-200 text-dark hover:bg-brand-50 flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 text-3xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cell}
          </button>
        ))}
      </div>

      <Button onClick={reset}>{started ? 'Yeni oyun' : 'Başla'}</Button>
      <p className="text-dark-500 text-center text-xs">
        Siz X, bilgisayar O — üçlü çizgiyi tamamlayın.
      </p>
    </div>
  );
}
