import type { Metadata } from 'next';
import { Orbitron, Rajdhani } from 'next/font/google';
import '@/styles/global.css';
import { CartProvider } from '@/context/CartContext';
import AppShell from '@/components/AppShell';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'ALL Shops',
  description: 'Sua fonte definitiva de sneakers premium. Estilo, qualidade e atitude em cada detalhe.',
  openGraph: {
    title: 'ALL Shops',
    description: 'Sua fonte definitiva de sneakers premium.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body suppressHydrationWarning>
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
