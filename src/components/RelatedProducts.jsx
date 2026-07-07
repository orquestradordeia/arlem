import React from 'react';
import { Link } from 'react-router-dom';
import products from '../data/products';
import { useCart } from '../context/CartContext';

function formatPrice(value) {
  return value.toFixed(2).replace('.', ',');
}

export default function RelatedProducts({ currentProduct }) {
  const { addToCart } = useCart();

  const related = products
    .filter(p => p.id !== currentProduct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  return (
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
            <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }} key={p.id}>
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
      </div>
    </section>
  );
}
