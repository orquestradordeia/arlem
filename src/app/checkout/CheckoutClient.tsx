'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useUserData } from '@/hooks/useUserData';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'pt-BR' });

type Step = 'form' | 'payment' | 'success';
type PaymentMethod = 'pix' | 'credit';

type FormData = {
  name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

export default function CheckoutClient() {
  const { cart, cartTotal, cartCount } = useCart();
  const [step, setStep] = useState<Step>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrCodeText, setQrCodeText] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [mpOrderId, setMpOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [expiresIn, setExpiresIn] = useState(300);

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '',
    street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', zip_code: '',
  });
  const [autoFilled, setAutoFilled] = useState(false);

  const { saved, save } = useUserData(form.email);

  useEffect(() => {
    if (!saved || autoFilled) return;
    setForm(prev => {
      const next = { ...prev };
      let changed = false;
      if (!prev.name && saved.name) { next.name = saved.name; changed = true; }
      if (!prev.phone && saved.phone) { next.phone = saved.phone; changed = true; }
      if (!prev.street && saved.address.street) { next.street = saved.address.street; changed = true; }
      if (!prev.number && saved.address.number) { next.number = saved.address.number; changed = true; }
      if (!prev.complement && saved.address.complement) { next.complement = saved.address.complement; changed = true; }
      if (!prev.neighborhood && saved.address.neighborhood) { next.neighborhood = saved.address.neighborhood; changed = true; }
      if (!prev.city && saved.address.city) { next.city = saved.address.city; changed = true; }
      if (!prev.state && saved.address.state) { next.state = saved.address.state; changed = true; }
      if (!prev.zip_code && saved.address.zip_code) { next.zip_code = saved.address.zip_code; changed = true; }
      if (changed) setAutoFilled(true);
      return next;
    });
  }, [saved, autoFilled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name !== 'email') setAutoFilled(true);
  };

  const handlePixSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.id,
            size_id: item.size ?? null,
            quantity: item.qty,
            unit_price: item.price,
            title: item.name,
          })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          address: {
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            zip_code: form.zip_code,
          },
          payment_method: 'pix',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido');

      save({
        name: form.name, phone: form.phone,
        address: {
          street: form.street, number: form.number,
          complement: form.complement, neighborhood: form.neighborhood,
          city: form.city, state: form.state, zip_code: form.zip_code,
        },
      });
      setOrderId(data.order.id);
      setMpOrderId(data.mpOrder.id);
      setQrCode(data.qrCode ?? '');
      setQrCodeText(data.qrCodeText ?? '');
      setExpiresIn(300);
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (cardData: { token: string; payment_method_id: string; installments: number }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.id,
            size_id: item.size ?? null,
            quantity: item.qty,
            unit_price: item.price,
            title: item.name,
          })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          address: {
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            zip_code: form.zip_code,
          },
          payment_method: 'credit',
          card: {
            token: cardData.token,
            payment_method_id: cardData.payment_method_id,
            installments: cardData.installments,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar pagamento');

      save({
        name: form.name, phone: form.phone,
        address: {
          street: form.street, number: form.number,
          complement: form.complement, neighborhood: form.neighborhood,
          city: form.city, state: form.state, zip_code: form.zip_code,
        },
      });
      setOrderId(data.order.id);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 'payment' || !mpOrderId || paid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-status?id=${mpOrderId}`);
        const data = await res.json();
        if (data.status === 'paid') {
          setPaid(true);
          setStep('success');
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, mpOrderId, paid]);

  useEffect(() => {
    if (step !== 'payment' || paid) return;
    const t = setInterval(() => setExpiresIn(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [step, paid]);

  const resetToForm = () => {
    setStep('form');
    setError('');
  };

  if (cartCount === 0 && step === 'form') {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Carrinho vazio</h2>
        <p style={{ margin: '16px 0', color: 'var(--text-secondary)' }}>Adicione produtos ao carrinho antes de finalizar a compra.</p>
        <Link href="/#produtos" className="checkout-btn" style={{ display: 'inline-block', width: 'auto', padding: '14px 40px', textDecoration: 'none' }}>VER PRODUTOS</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div className="breadcrumb" style={{ marginBottom: 32 }}>
        <Link href="/">Início</Link>
        <span> / </span>
        <Link href="/#produtos">Carrinho</Link>
        <span> / </span>
        <span>Checkout</span>
      </div>

      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2>Pagamento aprovado!</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Seu pedido #{orderId} foi confirmado.</p>
          <Link href="/#produtos" className="checkout-btn" style={{ display: 'inline-block', width: 'auto', padding: '14px 40px', textDecoration: 'none' }}>CONTINUAR COMPRANDO</Link>
        </div>
      )}

      {step === 'payment' && !paid && (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={resetToForm} style={{
              background: 'none', border: '1px solid var(--glass-border)', borderRadius: 8,
              padding: '8px 16px', color: 'inherit', cursor: 'pointer', fontSize: 14,
            }}>&larr; Voltar</button>
            <h2 style={{ margin: 0, color: 'var(--neon-cyan)' }}>Pague com Pix</h2>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32 }}>
            Escaneie o QR Code abaixo com seu banco para pagar
          </p>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            {qrCode && (
              <img src={`data:image/png;base64,${qrCode}`} alt="Pix QR Code"
                style={{ width: 280, height: 280, marginBottom: 24 }} />
            )}
            {qrCodeText && (
              <div style={{ width: '100%' }}>
                <p style={{ fontSize: 13, color: '#111', marginBottom: 8, fontWeight: 600 }}>Ou copie o código Pix:</p>
                <div style={{
                  background: '#eee', borderRadius: 8, padding: '12px 16px',
                  fontSize: 12, wordBreak: 'break-all', color: '#000', cursor: 'pointer',
                }} onClick={() => { navigator.clipboard.writeText(qrCodeText); alert('Código Pix copiado!'); }}>
                  {qrCodeText}
                </div>
                <p style={{ fontSize: 12, color: '#333', marginTop: 8, textAlign: 'center' }}>
                  Expira em {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
                </p>
              </div>
            )}
            <div style={{ marginTop: 24, textAlign: 'center', color: '#111' }}>
              <p style={{ fontWeight: 600 }}>Aguardando pagamento...</p>
              <div style={{ marginTop: 12, width: 40, height: 40, border: '3px solid var(--neon-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            </div>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, alignItems: 'start' }}>
          <div>
            <h2 style={{ marginBottom: 24 }}>Informações de entrega</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <input name="name" placeholder="Nome completo" value={form.name} onChange={handleChange}
                  style={inputStyle} required />
                <input name="email" placeholder="E-mail" type="email" value={form.email} onChange={handleChange}
                  style={inputStyle} required />
              </div>
              <input name="phone" placeholder="Telefone (WhatsApp)" value={form.phone} onChange={handleChange}
                style={inputStyle} required />
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 16 }}>
                <input name="street" placeholder="Logradouro" value={form.street} onChange={handleChange}
                  style={inputStyle} required />
                <input name="number" placeholder="Número" value={form.number} onChange={handleChange}
                  style={inputStyle} required />
              </div>
              <input name="complement" placeholder="Complemento (opcional)" value={form.complement} onChange={handleChange}
                style={inputStyle} />
              <input name="neighborhood" placeholder="Bairro" value={form.neighborhood} onChange={handleChange}
                style={inputStyle} required />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
                <input name="city" placeholder="Cidade" value={form.city} onChange={handleChange}
                  style={inputStyle} required />
                <input name="state" placeholder="UF" value={form.state} onChange={handleChange}
                  style={inputStyle} maxLength={2} required />
                <input name="zip_code" placeholder="CEP" value={form.zip_code} onChange={handleChange}
                  style={inputStyle} required />
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--glass-bg)', borderRadius: 12, padding: 24,
            border: '1px solid var(--glass-border)', position: 'sticky', top: 100,
          }}>
            <h3 style={{ marginBottom: 20 }}>Resumo do pedido</h3>
            {cart.map(item => (
              <div key={`${item.id}-${item.size}`} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid var(--glass-border)',
                fontSize: 14, gap: 12,
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.qty}x</span>{' '}
                  {item.name}
                  {item.size && <span style={{ color: 'var(--text-secondary)' }}> ({item.size})</span>}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>R$ {formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="cart-total" style={{ marginTop: 16 }}>
              <span>Total</span>
              <span>R$ {formatPrice(cartTotal)}</span>
            </div>

            <div style={{ margin: '20px 0' }}>
              <p style={{ fontSize: 13, marginBottom: 10, color: 'var(--text-secondary)' }}>Forma de pagamento</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  borderRadius: 8, border: `1px solid ${paymentMethod === 'pix' ? 'var(--neon-cyan)' : 'var(--glass-border)'}`,
                  cursor: 'pointer', fontSize: 13, background: paymentMethod === 'pix' ? 'rgba(0,255,255,0.08)' : 'transparent',
                }}>
                  <input type="radio" name="payment" value="pix" checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')} style={{ accentColor: 'var(--neon-cyan)' }} />
                  Pix
                </label>
                <label style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  borderRadius: 8, border: `1px solid ${paymentMethod === 'credit' ? 'var(--neon-cyan)' : 'var(--glass-border)'}`,
                  cursor: 'pointer', fontSize: 13, background: paymentMethod === 'credit' ? 'rgba(0,255,255,0.08)' : 'transparent',
                }}>
                  <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'}
                    onChange={() => setPaymentMethod('credit')} style={{ accentColor: 'var(--neon-cyan)' }} />
                  Cartão de Crédito
                </label>
              </div>
            </div>

            {error && <p style={{ color: '#ff4444', fontSize: 14, marginBottom: 12 }}>{error}</p>}

            {paymentMethod === 'pix' && (
              <button className="checkout-btn" onClick={handlePixSubmit} disabled={loading}
                style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? 'PROCESSANDO...' : 'FINALIZAR PEDIDO'}
              </button>
            )}

            {paymentMethod === 'credit' && (
              <div style={{
                marginTop: 16, minHeight: 320, position: 'relative',
                '--cardPaymentBrick-background-color': 'var(--glass-bg)',
                '--cardPaymentBrick-text-color': '#e0e0e0',
                '--cardPaymentBrick-input-background-color': '#1e1e2f',
                '--cardPaymentBrick-input-text-color': '#e0e0e0',
                '--cardPaymentBrick-input-border-color': '#333',
                '--cardPaymentBrick-error-color': '#ff6b6b',
              } as React.CSSProperties}>
                {loading && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: 'rgba(0,0,0,0.7)', borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 16,
                  }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--neon-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Processando pagamento...</p>
                  </div>
                )}
                {error && (
                  <div style={{
                    background: 'rgba(255,68,68,0.12)', border: '1px solid #ff4444',
                    borderRadius: 8, padding: '12px 16px', marginBottom: 12,
                    fontSize: 13, color: '#ff6b6b',
                  }}>
                    {error}
                  </div>
                )}
                <CardPayment
                  initialization={{ amount: cartTotal }}
                  customization={{
                    paymentMethods: { types: { included: ['credit_card'] } },
                    visual: { hideFormTitle: true, style: { theme: 'dark' } },
                  }}
                  onSubmit={async (param) => {
                    await handleCardPayment({
                      token: param.token,
                      payment_method_id: param.payment_method_id,
                      installments: param.installments,
                    });
                  }}
                  onError={(brickError) => {
                    setError(brickError.message);
                  }}
                  locale="pt-BR"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)', color: 'inherit', fontSize: 15, outline: 'none',
  boxSizing: 'border-box',
};
