'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { SizeModal } from './SizeModal';

interface ProductInfoProps {
  product: Product;
  onSizeGuideOpen: () => void;
}

export default function ProductInfo({ product, onSizeGuideOpen }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState<{ mode: 'add' | 'buy' } | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();
  const savings = product.oldPrice - product.price;

  const handleAdd = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setShowSizeModal({ mode: 'add' });
      return;
    }
    addToCart(product, selectedSize || undefined, qty);
  };

  const handleBuy = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setShowSizeModal({ mode: 'buy' });
      return;
    }
    addToCart(product, selectedSize || undefined, qty);
    router.push('/checkout');
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
      
      {product.sizes && product.sizes.length > 0 && (
        <div className="size-selector">
          <label>TAMANHO <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(BR)</span></label>
          <div className="sizes">
            {product.sizes.map(s => (
              <button
                key={s}
                id={`size-btn-${s}`}
                className={selectedSize === s ? 'active' : ''}
                onClick={() => setSelectedSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <a className="size-guide" onClick={onSizeGuideOpen}>📏 Tabela de Medidas</a>
        </div>
      )}

      <div className="qty-selector">
        <label>QUANTIDADE</label>
        <div className="qty-controls">
          <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
          <input type="text" value={qty} readOnly />
          <button onClick={() => setQty(Math.min(99, qty + 1))}>+</button>
        </div>
      </div>
      <button className="btn-add-cart" onClick={handleAdd}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 6 }}>
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        ADICIONAR AO CARRINHO
      </button>
      <button id="buy-now-btn" className="btn-buy-now-product" onClick={handleBuy}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 6 }}>
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
        COMPRAR AGORA
      </button>
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
      {showSizeModal && <SizeModal product={product} mode={showSizeModal.mode} onClose={() => setShowSizeModal(null)} />}
    </div>
  );
}
