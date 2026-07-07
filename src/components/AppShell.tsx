'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import TopBar from './TopBar';
import Header from './Header';
import CartDrawer from './CartDrawer';
import Footer from './Footer';

export default function AppShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isCheckout = pathname.startsWith('/checkout');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <TopBar />
      <Header
        onCartToggle={() => setCartOpen(o => !o)}
        onSearchToggle={() => alert('Função de busca')}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {children}
      {!isCheckout && <MobileCartButton onClick={() => setCartOpen(true)} />}
      <Footer />
    </>
  );
}

function MobileCartButton({ onClick }: { onClick: () => void }) {
  const { cartTotal, cartCount, lastAddedAt } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (lastAddedAt) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 800);
      return () => clearTimeout(t);
    }
  }, [lastAddedAt]);

  if (cartCount === 0) return null;

  return (
    <button className={`mobile-cart-btn${pulse ? ' pulse' : ''}`} onClick={onClick}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
      Carrinho · R$ {cartTotal.toFixed(2).replace('.', ',')}
    </button>
  );
}
