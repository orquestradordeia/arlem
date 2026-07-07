'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, cartTotal } = useCart();

  return (
    <>
      <div className={`cart-drawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer${open ? ' open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>CARRINHO</h3>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        <div className="cart-drawer-items">
          {cart.length === 0 ? (
            <div className="cart-empty">Seu carrinho está vazio</div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={`${item.id}-${item.size ?? ''}`}>
                <img src={item.img} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}{item.size ? ` (${item.size})` : ''}</h4>
                  <div className="item-price">R$ {item.price.toFixed(2).replace('.', ',')} x {item.qty}</div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>&times;</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <Link href="/checkout" className="checkout-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }} onClick={onClose}>FINALIZAR PEDIDO</Link>
          </div>
        )}
      </div>
    </>
  );
}
