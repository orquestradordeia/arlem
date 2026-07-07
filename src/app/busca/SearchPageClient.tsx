'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { SizeModal } from '@/components/SizeModal';
import { useCart } from '@/context/CartContext';

function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

export default function SearchPageClient({
  products,
  query,
}: {
  products: Product[];
  query: string;
}) {
  const [q, setQ] = useState(query);
  const [modalProduct, setModalProduct] = useState<{ product: Product; mode: 'add' | 'buy' } | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/busca?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      {/* Hero / search bar */}
      <div className="busca-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Início</Link>
            <span> / </span>
            <span>Busca</span>
          </nav>

          <h1 className="busca-title">
            {query ? (
              <>
                Resultados para{' '}
                <span className="busca-query">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              'Busca de Produtos'
            )}
          </h1>

          <form className="busca-form" onSubmit={handleSubmit}>
            <svg className="busca-form-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              id="busca-input"
              type="text"
              className="busca-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar produtos, marcas, categorias…"
              autoComplete="off"
            />
            <button id="busca-submit" type="submit" className="busca-submit">
              BUSCAR
            </button>
          </form>

          <p className="busca-count">
            {query && (
              products.length === 0
                ? 'Nenhum produto encontrado'
                : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`
            )}
          </p>
        </div>
      </div>

      {/* Results */}
      {products.length > 0 ? (
        <section className="container busca-grid-section">
          <div className="product-grid">
            {products.map(p => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product-card">
                  <div className="badge">{p.badge}</div>
                  <div className="image-wrap">
                    <img src={p.img} alt={p.name} loading="lazy" />
                    <div className="glow" />
                  </div>
                  <div className="info">
                    <h3>{p.name}</h3>
                    <p className="busca-card-brand">{p.brand}</p>
                    <div className="price-row">
                      <span className="price-old">R$ {formatPrice(p.oldPrice)}</span>
                      <span className="price-current">R$ {formatPrice(p.price)}</span>
                    </div>
                    <div className="installment">
                      ou 4x de R$ {formatPrice(p.price / 4)} sem juros
                    </div>
                    <div className="btn-group-card">
                      <button
                        className="btn-add"
                        onClick={e => {
                          e.preventDefault();
                          setModalProduct({ product: p, mode: 'add' });
                        }}
                      >
                        <CartIcon /> ADICIONAR AO CARRINHO
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : query ? (
        <div className="busca-empty">
          <div className="busca-empty-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
          <h2>Nenhum resultado para &ldquo;{query}&rdquo;</h2>
          <p>Tente palavras-chave diferentes ou explore nosso catálogo completo.</p>
          <Link href="/#produtos" className="busca-empty-cta">
            Ver todos os produtos
          </Link>
        </div>
      ) : null}

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
