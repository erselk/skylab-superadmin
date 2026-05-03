'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';

const GRID_SIZE = 20;
const CELL_PCT = 100 / GRID_SIZE;
const INITIAL_SNAKE = [[5, 5]];
const INITIAL_DIRECTION = [1, 0];

export function SnakeGame() {
  const boardRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef(INITIAL_DIRECTION);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState([10, 10]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback(() => {
    let newFood: number[];
    do {
      newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
    } while (snake.some((segment) => segment[0] === newFood[0] && segment[1] === newFood[1]));
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    generateFood();
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const d = directionRef.current;
        const newHead = [prevSnake[0][0] + d[0], prevSnake[0][1] + d[1]];

        // Check collisions
        if (
          newHead[0] < 0 ||
          newHead[0] >= GRID_SIZE ||
          newHead[1] < 0 ||
          newHead[1] >= GRID_SIZE ||
          prevSnake.some((segment) => segment[0] === newHead[0] && segment[1] === newHead[1])
        ) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => s + 1);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(moveSnake);
  }, [food, gameOver, isPlaying, generateFood]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const [, dy] = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (dy !== 1) setDirection([0, -1]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (dy !== -1) setDirection([0, 1]);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (directionRef.current[0] !== 1) setDirection([-1, 0]);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (directionRef.current[0] !== -1) setDirection([1, 0]);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPlaying]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      queueMicrotask(() => boardRef.current?.focus({ preventScroll: true }));
    }
  }, [gameOver, isPlaying]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Yılan Oyunu</h3>
      <div className="text-brand text-lg font-semibold">Skor: {score}</div>

      <div className="w-full shrink-0">
        <div
          ref={boardRef}
          role="application"
          aria-label="Yılan tahtası"
          tabIndex={0}
          className="focus:ring-brand/40 outline-none focus-visible:ring-2"
          style={{ touchAction: 'none' }}
        >
          <div className="bg-dark-100 border-dark-300 relative mx-auto box-border aspect-square w-full max-w-sm border-2">
            {snake.map((segment, i) => (
              <div
                key={i}
                className="bg-brand absolute box-border rounded-[2px]"
                style={{
                  left: `${segment[0] * CELL_PCT}%`,
                  top: `${segment[1] * CELL_PCT}%`,
                  width: `calc(${CELL_PCT}% - 4px)`,
                  height: `calc(${CELL_PCT}% - 4px)`,
                }}
              />
            ))}
            <div
              className="absolute box-border rounded-full bg-red-500"
              style={{
                left: `${food[0] * CELL_PCT}%`,
                top: `${food[1] * CELL_PCT}%`,
                width: `calc(${CELL_PCT}% - 4px)`,
                height: `calc(${CELL_PCT}% - 4px)`,
              }}
            />

            {gameOver && (
              <div className="bg-dark/50 absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                Oyun Bitti!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isPlaying && <Button onClick={resetGame}>{gameOver ? 'Tekrar Oyna' : 'Başla'}</Button>}
      </div>
      <p className="text-sm text-gray-500">
        Başladıktan sonra yön tuşları ile oynayın; taşma ve sayfa kaydırması engellenir.
      </p>
    </div>
  );
}
