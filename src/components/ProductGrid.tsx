'use client';

import Link from 'next/link';
import type { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function ProductGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCart();

  return (
    <>
      <div className="section-title" id="produtos">
        <span className="sub">Best Sellers</span>
        <h2>LANÇAMENTOS EXCLUSIVOS</h2>
      </div>
      <section className="container">
        <div className="product-grid">
          {products.map(p => (
            <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }} key={p.id}>
              <div className="product-card">
                <div className="badge">{p.badge}</div>
                <div className="image-wrap">
                  <img src={p.img} alt={p.name} loading="lazy" />
                  <div className="glow"></div>
                </div>
                <div className="info">
                  <h3>{p.name}</h3>
                  <div className="price-row">
                    <span className="price-old">R$ {formatPrice(p.oldPrice)}</span>
                    <span className="price-current">R$ {formatPrice(p.price)}</span>
                  </div>
                  <div className="installment">ou 4x de R$ {formatPrice(p.price / 4)} sem juros</div>
                  <button className="btn-add" onClick={e => { e.preventDefault(); addToCart(p); }}>ADICIONAR AO CARRINHO</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
