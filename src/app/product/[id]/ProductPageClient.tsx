'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import ProductGallery from '@/components/ProductGallery';
import ProductInfo from '@/components/ProductInfo';
import SizeGuideModal from '@/components/SizeGuideModal';
import RelatedProducts from '@/components/RelatedProducts';

export default function ProductPageClient({ product, allProducts }: { product: Product; allProducts: Product[] }) {
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <Link href="/">Início</Link>
          <span> / </span>
          <Link href="/#produtos">Produtos</Link>
          <span> / </span>
          <span>{product.name}</span>
        </div>
      </div>

      <section className="product-section">
        <div className="container">
          <div className="product-layout">
            <ProductGallery images={product.images} badge={product.badge} />
            <ProductInfo product={product} onSizeGuideOpen={() => setSizeGuideOpen(true)} />
          </div>
        </div>
      </section>

      <section className="product-extras">
        <div className="container">
          <div className="product-tabs">
            <button className={activeTab === 'desc' ? 'active' : ''} onClick={() => setActiveTab('desc')}>DESCRIÇÃO</button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>AVALIAÇÕES</button>
          </div>
          <div className={`tab-content${activeTab === 'desc' ? ' active' : ''}`}>
            <p dangerouslySetInnerHTML={{ __html: product.description }} />
            <ul>
              {product.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
          <div className={`tab-content${activeTab === 'reviews' ? ' active' : ''}`}>
            {product.reviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhuma avaliação ainda.</p>
            ) : (
              <div className="reviews-grid">
                {product.reviews.map((r, i) => (
                  <div className="review-card" key={i}>
                    <div className="review-header">
                      <div className="avatar">{r.name.charAt(0)}</div>
                      <div className="review-info">
                        <h4>{r.name}</h4>
                        <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                    </div>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <RelatedProducts currentProduct={product} allProducts={allProducts} />
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
