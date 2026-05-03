'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

type Card = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const initializeGame = () => {
    const shuffledIcons = [...ICONS, ...ICONS].sort(() => Math.random() - 0.5);

    setCards(
      shuffledIcons.map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      })),
    );
    setFlippedCards([]);
    setMoves(0);
    setIsPlaying(true);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].icon === cards[second].icon) {
        // Match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true, isFlipped: true }
                : card,
            ),
          );
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second ? { ...card, isFlipped: false } : card,
            ),
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isWin = cards.length > 0 && cards.every((c) => c.isMatched);

  return (
    <div className="mx-auto flex w-full max-w-lg min-w-0 flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-dark text-xl font-bold">Hafıza Oyunu</h3>
      <div className="text-brand text-lg font-semibold">Hamle: {moves}</div>

      <div className="grid w-full max-w-[min(100%,280px)] grid-cols-4 gap-2 sm:max-w-xs">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`flex aspect-square min-h-0 w-full cursor-pointer items-center justify-center rounded-md text-lg transition-all duration-300 sm:text-2xl ${card.isFlipped || card.isMatched ? 'border-brand rotate-0 border-2 bg-white' : 'bg-brand rotate-180'} `}
            onClick={() => handleCardClick(card.id)}
          >
            {card.isFlipped || card.isMatched ? card.icon : ''}
          </div>
        ))}
      </div>

      {isWin && <div className="text-xl font-bold text-green-600">Tebrikler! Kazandın!</div>}

      <Button onClick={initializeGame}>{isPlaying ? 'Yeniden Başlat' : 'Başla'}</Button>
    </div>
  );
}
