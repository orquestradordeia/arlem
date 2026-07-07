'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    if (!q) return;
    onClose();
    router.push(`/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <div
        className={`search-overlay-backdrop${open ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`search-overlay${open ? ' visible' : ''}`} role="dialog" aria-label="Buscar produtos">
        <div className="container">
          <form className="search-overlay-form" onSubmit={handleSubmit}>
            <svg className="search-overlay-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              ref={inputRef}
              id="search-overlay-input"
              type="text"
              className="search-overlay-input"
              placeholder="Buscar produtos, marcas, categorias…"
              autoComplete="off"
            />
            <button type="submit" className="search-overlay-btn">BUSCAR</button>
            <button
              type="button"
              className="search-overlay-close"
              onClick={onClose}
              aria-label="Fechar busca"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
