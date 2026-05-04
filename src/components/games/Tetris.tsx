'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { useGameVictory } from '@/components/games/GameVictoryContext';

const COLS = 10;
const ROWS = 20;
const DROP_MS = 700;

/** 7 tip × 4 dönüş; her biri 4×4, 1 = dolu hücre */
const SHAPES: number[][][][] = [
  [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ],
  [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  [
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
];

const CELL_CLASS: Record<number, string> = {
  1: 'bg-cyan-400 shadow-inner',
  2: 'bg-yellow-300 shadow-inner',
  3: 'bg-violet-500 shadow-inner',
  4: 'bg-green-500 shadow-inner',
  5: 'bg-red-500 shadow-inner',
  6: 'bg-blue-600 shadow-inner',
  7: 'bg-orange-500 shadow-inner',
};

type Piece = { t: number; r: number; c: number; rot: number };

type GameState = {
  board: number[][];
  piece: Piece | null;
  score: number;
  gameOver: boolean;
  playing: boolean;
};

function emptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function collides(board: number[][], p: Piece): boolean {
  const m = SHAPES[p.t][p.rot];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!m[i][j]) continue;
      const rr = p.r + i;
      const cc = p.c + j;
      if (cc < 0 || cc >= COLS || rr >= ROWS) return true;
      if (rr >= 0 && board[rr][cc]) return true;
    }
  }
  return false;
}

function spawnPiece(): Piece {
  return { t: Math.floor(Math.random() * 7), r: 0, c: 3, rot: 0 };
}

function mergeAndClear(
  board: number[][],
  p: Piece,
): { board: number[][]; cleared: number; scoreGain: number } {
  const next = board.map((row) => [...row]);
  const m = SHAPES[p.t][p.rot];
  let id = p.t + 1;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!m[i][j]) continue;
      const rr = p.r + i;
      const cc = p.c + j;
      if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) next[rr][cc] = id;
    }
  }
  const filled: number[][] = [];
  let cleared = 0;
  for (let r = 0; r < ROWS; r++) {
    if (next[r].every((cell) => cell > 0)) {
      cleared++;
    } else {
      filled.push(next[r]);
    }
  }
  while (filled.length < ROWS) {
    filled.unshift(Array(COLS).fill(0));
  }
  const table = [0, 100, 300, 500, 800];
  const scoreGain = table[Math.min(cleared, 4)] ?? 800;
  return { board: filled, cleared, scoreGain };
}

const KICKS: [number, number][] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
  [-2, 0],
  [2, 0],
];

type Action =
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'MOVE'; dr: number; dc: number }
  | { type: 'ROTATE' }
  | { type: 'HARD_DROP' };

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'RESET') {
    const board = emptyBoard();
    const piece = spawnPiece();
    const overlaps = collides(board, piece);
    return {
      board,
      piece: overlaps ? null : piece,
      score: 0,
      gameOver: overlaps,
      playing: true,
    };
  }

  if (!state.playing || state.gameOver) return state;
  if (!state.piece) return state;

  switch (action.type) {
    case 'TICK': {
      const p = state.piece!;
      const down = { ...p, r: p.r + 1 };
      if (!collides(state.board, down)) {
        return { ...state, piece: down };
      }
      const { board: b2, scoreGain } = mergeAndClear(state.board, p);
      const nextP = spawnPiece();
      if (collides(b2, nextP)) {
        return { ...state, board: b2, piece: null, gameOver: true, score: state.score + scoreGain };
      }
      return { ...state, board: b2, piece: nextP, score: state.score + scoreGain };
    }
    case 'MOVE': {
      const p = state.piece!;
      const shifted = { ...p, r: p.r + action.dr, c: p.c + action.dc };
      if (collides(state.board, shifted)) return state;
      return { ...state, piece: shifted };
    }
    case 'ROTATE': {
      const p = state.piece!;
      const nextRot = (p.rot + 1) % 4;
      for (const [dr, dc] of KICKS) {
        const tryP = { ...p, rot: nextRot, r: p.r + dr, c: p.c + dc };
        if (!collides(state.board, tryP)) {
          return { ...state, piece: tryP };
        }
      }
      return state;
    }
    case 'HARD_DROP': {
      let p = state.piece!;
      while (!collides(state.board, { ...p, r: p.r + 1 })) {
        p = { ...p, r: p.r + 1 };
      }
      const { board: b2, scoreGain } = mergeAndClear(state.board, p);
      const nextP = spawnPiece();
      if (collides(b2, nextP)) {
        return { ...state, board: b2, piece: null, gameOver: true, score: state.score + scoreGain };
      }
      return { ...state, board: b2, piece: nextP, score: state.score + scoreGain };
    }
    default:
      return state;
  }
}

export function TetrisGame() {
  const [state, dispatch] = useReducer(reducer, {
    board: emptyBoard(),
    piece: null,
    score: 0,
    gameOver: false,
    playing: false,
  });
  const boardRef = useRef<HTMLDivElement>(null);
  const celebratedRun = useRef(false);
  const { celebrateVictory } = useGameVictory();

  const startGame = () => {
    celebratedRun.current = false;
    dispatch({ type: 'RESET' });
  };

  useEffect(() => {
    if (!state.gameOver) {
      celebratedRun.current = false;
      return;
    }
    if (state.score < 70 || celebratedRun.current) return;
    celebratedRun.current = true;
    celebrateVictory({ gameTitle: 'Tetris' });
  }, [state.gameOver, state.score, celebrateVictory]);

  useEffect(() => {
    if (!state.playing || state.gameOver) return;
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), DROP_MS);
    return () => clearInterval(id);
  }, [state.playing, state.gameOver]);

  useEffect(() => {
    if (state.playing && !state.gameOver) {
      queueMicrotask(() => boardRef.current?.focus({ preventScroll: true }));
    }
  }, [state.playing, state.gameOver]);

  useEffect(() => {
    if (!state.playing || state.gameOver) return;

    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      const moveKeys = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', ' '];
      if (moveKeys.includes(k)) {
        e.preventDefault();
      }
      switch (k) {
        case 'ArrowLeft':
          dispatch({ type: 'MOVE', dr: 0, dc: -1 });
          break;
        case 'ArrowRight':
          dispatch({ type: 'MOVE', dr: 0, dc: 1 });
          break;
        case 'ArrowDown':
          dispatch({ type: 'MOVE', dr: 1, dc: 0 });
          break;
        case 'ArrowUp':
          dispatch({ type: 'ROTATE' });
          break;
        case ' ':
          dispatch({ type: 'HARD_DROP' });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [state.playing, state.gameOver]);

  const cellAt = useCallback(
    (r: number, c: number): number => {
      let v = state.board[r]?.[c] ?? 0;
      if (!v && state.piece) {
        const m = SHAPES[state.piece.t][state.piece.rot];
        const i = r - state.piece.r;
        const j = c - state.piece.c;
        if (i >= 0 && i < 4 && j >= 0 && j < 4 && m[i][j]) {
          v = state.piece.t + 1;
        }
      }
      return v;
    },
    [state.board, state.piece],
  );

  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = cellAt(r, c);
      cells.push(
        <div
          key={`${r}-${c}`}
          className={`aspect-square rounded-[1px] border border-black/10 ${
            v ? (CELL_CLASS[v] ?? 'bg-brand') : 'bg-dark-100'
          } `}
        />,
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md min-w-0 flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Tetris</h3>
      <div className="text-brand text-lg font-semibold">Skor: {state.score}</div>
      {state.gameOver && (
        <p className="text-center text-sm font-medium text-red-600">Oyun bitti — tahta doldu.</p>
      )}

      <div
        ref={boardRef}
        tabIndex={0}
        role="application"
        aria-label="Tetris tahtası"
        className="focus-visible:ring-brand/40 w-full max-w-[min(100%,16rem)] cursor-pointer outline-none focus-visible:ring-2"
        style={{ touchAction: 'none' }}
      >
        <div
          className="border-dark-300 bg-dark-300 grid aspect-[10/20] w-full cursor-pointer grid-cols-10 gap-px border-2 p-px"
          style={{ gridAutoRows: '1fr' }}
        >
          {cells}
        </div>
      </div>

      {!state.playing || state.gameOver ? (
        <Button onClick={startGame}>{state.gameOver ? 'Tekrar oyna' : 'Başla'}</Button>
      ) : null}

      <p className="text-dark-500 text-center text-xs">
        ← → hareket, ↑ döndür, ↓ hızlı düş, boşluk anında bırak. Sayfa kaydırılmaz.
      </p>
    </div>
  );
}
