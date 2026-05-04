'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 cursor-pointer"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
        aria-hidden
      />
      <div className="bg-light border-dark-200 relative z-10 mx-4 w-full max-w-md rounded-lg border shadow-xl">
        <div className="border-dark-200 flex items-center justify-between border-b p-6">
          <h2 className="text-brand text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-dark cursor-pointer text-2xl font-bold opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
        <div className="text-dark p-6">{children}</div>
      </div>
    </div>
  );
}
