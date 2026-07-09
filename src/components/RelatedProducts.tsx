'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { SizeModal } from './SizeModal';

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
}

export default function RelatedProducts({ currentProduct, allProducts }: RelatedProductsProps) {
  const { addToCart } = useCart();
  const [modalProduct, setModalProduct] = useState<{ product: Product; mode: 'add' | 'buy' } | null>(null);

  const related = allProducts
    .filter(p => p.id !== currentProduct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  return (
    <>
      <section className="related-products" style={{ paddingBottom: 60 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, color: 'var(--neon-cyan)', letterSpacing: 4, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Você também pode gostar
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg,var(--neon-cyan),var(--neon-magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PRODUTOS RELACIONADOS
            </h2>
          </div>
          <div className="related-grid">
            {related.map(p => (
              <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }} key={p.id}>
                <div className="product-card">
                  <div className="badge">{p.badge}</div>
                  <div className="image-wrap" style={{ position: 'relative' }}>
                    <Image
                      src={p.img}
                      alt={p.name}
                      fill
                      sizes="(max-width: 480px) 50vw, 25vw"
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
                    <button className="btn-add" onClick={e => {
                      e.preventDefault();
                      if (p.sizes && p.sizes.length > 0) {
                        setModalProduct({ product: p, mode: 'add' });
                      } else {
                        addToCart(p, undefined, 1);
                      }
                    }}>ADICIONAR AO CARRINHO</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
