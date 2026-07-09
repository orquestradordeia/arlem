'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { SizeModal } from './SizeModal';

function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
  );
}

export default function ProductGrid({ products, title, subtitle, id }: {
  products: Product[];
  title: string;
  subtitle?: string;
  id?: string;
}) {
  const [modalProduct, setModalProduct] = useState<{ product: Product; mode: 'add' | 'buy' } | null>(null);

  if (products.length === 0) return null;

  return (
    <>
      <div className="section-title" id={id}>
        {subtitle && <span className="sub">{subtitle}</span>}
        <h2>{title}</h2>
      </div>
      <section className="container">
        <div className="product-grid">
          {products.map(p => (
            <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }} key={p.id} id={`product-card-${p.id}`}>
              <div className="product-card">
                <div className="badge">{p.badge}</div>
                <div className="image-wrap" style={{ position: 'relative' }}>
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ objectFit: 'contain' }}
                    quality={80}
                    loading="lazy"
                  />
                  <div className="glow"></div>
                </div>
                <div className="info">
                  <h3>{p.name}</h3>
                  <div className="price-row">
                    <span className="price-old">R$ {formatPrice(p.oldPrice)}</span>
                    <span className="price-current">R$ {formatPrice(p.price)}</span>
                  </div>
                  <div className="installment">ou 4x de R$ {formatPrice(p.price / 4)} sem juros</div>
                  <div className="btn-group-card">
                    <button className="btn-add" onClick={e => { e.preventDefault(); setModalProduct({ product: p, mode: 'add' }); }}>
                      <CartIcon /> ADICIONAR AO CARRINHO
                    </button>
                    <button className="btn-buy-now" onClick={e => { e.preventDefault(); setModalProduct({ product: p, mode: 'buy' }); }}>
                      <DollarIcon /> COMPRAR AGORA
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {modalProduct && (
        <SizeModal
          product={modalProduct.product}
          mode={modalProduct.mode}
          onClose={() => setModalProduct(null)}
        />
      )}
    </>
  );
}
