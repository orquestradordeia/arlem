'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import Header from './Header';
import CartDrawer from './CartDrawer';
import Footer from './Footer';

export default function AppShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

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
      <Footer />
    </>
  );
}
