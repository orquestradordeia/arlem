'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function SizeModal({ product, mode, onClose }: {
  product: Product;
  mode?: 'add' | 'buy';
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAdd = () => {
    if (!selected) return;
    addToCart(product, selected);
    if (mode === 'buy') {
      router.push('/checkout');
    }
    onClose();
  };

  const handleBuy = () => {
    if (!selected) return;
    addToCart(product, selected);
    onClose();
    router.push('/checkout');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 16,
        border: '1px solid var(--glass-border)', padding: 32,
        width: '100%', maxWidth: 380, textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width: 64, height: 64, margin: '0 auto 16px', borderRadius: 12, overflow: 'hidden',
        }}>
          <Image src={product.img} alt={product.name} width={64} height={64} quality={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h3 style={{ fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</h3>
        <p style={{ fontSize: 14, color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', marginBottom: 20 }}>
          R$ {formatPrice(product.price)}
        </p>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, textAlign: 'left' }}>
          Selecione o tamanho (BR)
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          {product.sizes.map(s => (
            <button key={s} onClick={() => setSelected(s)}
              style={{
                width: 48, height: 48, borderRadius: 10, border: `1px solid ${selected === s ? 'var(--neon-cyan)' : 'var(--glass-border)'}`,
                background: selected === s ? 'rgba(0,255,255,0.1)' : 'var(--glass-bg)',
                color: selected === s ? 'var(--neon-cyan)' : 'inherit',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <button onClick={handleAdd} disabled={!selected}
            className="checkout-btn" style={{
              width: '100%', padding: '14px 0', fontSize: 13, opacity: selected ? 1 : 0.4,
              cursor: selected ? 'pointer' : 'not-allowed',
            }}>
            {mode === 'buy' ? 'COMPRAR AGORA' : 'ADICIONAR AO CARRINHO'}
          </button>
          {mode !== 'buy' && (
            <button onClick={handleBuy} disabled={!selected}
              style={{
                width: '100%', padding: '14px 0', fontSize: 13, cursor: selected ? 'pointer' : 'not-allowed',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: 8, color: 'var(--text-primary)', transition: 'var(--transition)',
                opacity: selected ? 1 : 0.4,
              }}>
              COMPRAR AGORA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
