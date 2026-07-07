'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  onCartToggle: () => void;
  onSearchToggle: () => void;
}

export default function Header({ onCartToggle, onSearchToggle }: HeaderProps) {
  const { cartCount } = useCart();

  return (
    <header className="header">
      <div className="container">
          <Link href="/" className="header-logo">
          <img src="/images/AEL.png" alt="Store" />
          <span>STORE</span>
        </Link>
        <nav className="header-nav">
          <Link href="/">Início</Link>
          <Link href="/#produtos">Produtos</Link>
          <a href="#">Sobre Nós</a>
          <a href="#">Contato</a>
        </nav>
        <div className="header-actions">
          <button onClick={onSearchToggle} title="Buscar">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </button>
          <button onClick={onCartToggle} title="Carrinho">
            <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
