'use client';

import { useState } from 'react';

import { SnakeGame } from '@/components/games/Snake';
import { MinesweeperGame } from '@/components/games/Minesweeper';
import { MemoryGame } from '@/components/games/Memory';
import { TicTacToeGame } from '@/components/games/TicTacToe';
import { SimonGame } from '@/components/games/Simon';
import { TetrisGame } from '@/components/games/Tetris';

type GameType = 'snake' | 'minesweeper' | 'memory' | 'tictactoe' | 'simon' | 'tetris' | null;

export default function WaitingRoomPage() {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-brand text-3xl font-bold">Bekleme Salonu</h1>
        <p className="text-dark-600 text-lg">
          Hesabınız henüz yetkilendirilmemiştir. Yönetici onayı beklerken oyun oynayarak vakit
          geçirebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <button
          type="button"
          onClick={() => setActiveGame('snake')}
          className={`rounded-xl border-2 p-4 transition-all hover:scale-[1.02] sm:p-6 ${
            activeGame === 'snake'
              ? 'border-brand bg-brand-50'
              : 'border-dark-200 hover:border-brand-200 bg-white'
          }`}
        >
          <div className="mb-2 text-3xl sm:text-4xl">🐍</div>
          <h3 className="text-dark text-lg font-bold sm:text-xl">Yılan</h3>
          <p className="text-dark-500 hidden text-xs sm:block sm:text-sm">Klasik yılan oyunu</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveGame('minesweeper')}
          className={`rounded-xl border-2 p-4 transition-all hover:scale-[1.02] sm:p-6 ${
            activeGame === 'minesweeper'
              ? 'border-brand bg-brand-50'
              : 'border-dark-200 hover:border-brand-200 bg-white'
          }`}
        >
          <div className="mb-2 text-3xl sm:text-4xl">💣</div>
          <h3 className="text-dark text-lg font-bold sm:text-xl">Mayın Tarlası</h3>
          <p className="text-dark-500 hidden text-xs sm:block sm:text-sm">Dikkatli bas!</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveGame('memory')}
          className={`rounded-xl border-2 p-4 transition-all hover:scale-[1.02] sm:p-6 ${
            activeGame === 'memory'
              ? 'border-brand bg-brand-50'
              : 'border-dark-200 hover:border-brand-200 bg-white'
          }`}
        >
          <div className="mb-2 text-3xl sm:text-4xl">🎴</div>
          <h3 className="text-dark text-lg font-bold sm:text-xl">Hafıza</h3>
          <p className="text-dark-500 hidden text-xs sm:block sm:text-sm">Eşleri bul</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveGame('tictactoe')}
          className={`rounded-xl border-2 p-4 transition-all hover:scale-[1.02] sm:p-6 ${
            activeGame === 'tictactoe'
              ? 'border-brand bg-brand-50'
              : 'border-dark-200 hover:border-brand-200 bg-white'
          }`}
        >
          <div className="mb-2 text-3xl sm:text-4xl">⭕</div>
          <h3 className="text-dark text-lg font-bold sm:text-xl">XOX</h3>
          <p className="text-dark-500 hidden text-xs sm:block sm:text-sm">Bilgisayara karşı</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveGame('simon')}
          className={`rounded-xl border-2 p-4 transition-all hover:scale-[1.02] sm:p-6 ${
            activeGame === 'simon'
              ? 'border-brand bg-brand-50'
              : 'border-dark-200 hover:border-brand-200 bg-white'
          }`}
        >
          <div className="mb-2 text-3xl sm:text-4xl">🎹</div>
          <h3 className="text-dark text-lg font-bold sm:text-xl">Simon</h3>
          <p className="text-dark-500 hidden text-xs sm:block sm:text-sm">Sırayı ezberle</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveGame('tetris')}
          className={`rounded-xl border-2 p-4 transition-all hover:scale-[1.02] sm:p-6 ${
            activeGame === 'tetris'
              ? 'border-brand bg-brand-50'
              : 'border-dark-200 hover:border-brand-200 bg-white'
          }`}
        >
          <div className="mb-2 text-3xl sm:text-4xl">🧱</div>
          <h3 className="text-dark text-lg font-bold sm:text-xl">Tetris</h3>
          <p className="text-dark-500 hidden text-xs sm:block sm:text-sm">Blok diz</p>
        </button>
      </div>

      <div className="flex min-h-[min(420px,50svh)] w-full min-w-0 justify-center overflow-x-auto overflow-y-visible py-2">
        <div className="flex w-full max-w-full min-w-0 justify-center px-1">
          {activeGame === 'snake' && <SnakeGame />}
          {activeGame === 'minesweeper' && <MinesweeperGame />}
          {activeGame === 'memory' && <MemoryGame />}
          {activeGame === 'tictactoe' && <TicTacToeGame />}
          {activeGame === 'simon' && <SimonGame />}
          {activeGame === 'tetris' && <TetrisGame />}
          {!activeGame && (
            <div className="text-dark-400 flex items-center justify-center italic">
              Oynamak için bir oyun seçin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
