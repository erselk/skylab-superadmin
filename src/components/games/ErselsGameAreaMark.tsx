'use client';

type Props = {
  className?: string;
};

/** Mark for Ersel's Game Area — uses `public/secret.png`. */
export function ErselsGameAreaMark({ className }: Props) {
  return (
    <img
      src="/secret.png"
      alt=""
      className={`object-cover ${className ?? ''}`}
      draggable={false}
      aria-hidden
    />
  );
}
