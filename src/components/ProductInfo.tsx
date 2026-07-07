'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface ProductInfoProps {
  product: Product;
  onSizeGuideOpen: () => void;
}

export default function ProductInfo({ product, onSizeGuideOpen }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const savings = product.oldPrice - product.price;

  const handleAdd = () => {
    if (!selectedSize) {
      alert('Selecione um tamanho antes de adicionar ao carrinho.');
      return;
    }
    addToCart(product, selectedSize, qty);
  };

  return (
    <div className="product-info">
      <div className="stock"><span className="dot"></span> Em estoque</div>
      <div className="brand">{product.brand}</div>
      <h1>{product.name}</h1>
      <div className="rating">
        <span className="stars">★★★★★</span>
        <span>{product.reviews.length} avaliações</span>
      </div>
      <div className="price-block">
        <div className="price-old">R$ {formatPrice(product.oldPrice)}</div>
        <div className="price-current">R$ {formatPrice(product.price)}</div>
        <div className="price-save">Economize R$ {formatPrice(savings)} ({product.badge})</div>
        <div className="installment">ou 4x de R$ {formatPrice(product.price / 4)} sem juros</div>
      </div>
      <div className="size-selector">
        <label>TAMANHO <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(BR)</span></label>
        <div className="sizes">
          {product.sizes.map(s => (
            <button
              key={s}
              className={selectedSize === s ? 'active' : ''}
              onClick={() => setSelectedSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <a className="size-guide" onClick={onSizeGuideOpen}>📏 Tabela de Medidas</a>
      </div>
      <div className="qty-selector">
        <label>QUANTIDADE</label>
        <div className="qty-controls">
          <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
          <input type="text" value={qty} readOnly />
          <button onClick={() => setQty(Math.min(99, qty + 1))}>+</button>
        </div>
      </div>
      <button className="btn-add-cart" onClick={handleAdd}>ADICIONAR AO CARRINHO</button>
      <button className="btn-wishlist" onClick={() => alert('Adicionado aos favoritos!')}>♡ ADICIONAR À LISTA DE DESEJOS</button>
      <div className="trust-badges">
        {[
          { label: '5% OFF no PIX', sub: 'Desconto especial' },
          { label: 'Troca Grátis', sub: 'Em até 7 dias' },
          { label: 'Frete Grátis', sub: 'Para todo Brasil' },
          { label: 'Rastreio', sub: 'Código enviado após postagem' },
        ].map((t, i) => (
          <div className="trust-badge" key={i}>
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
            <div><strong>{t.label}</strong><span>{t.sub}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
