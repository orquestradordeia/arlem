'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useUserData } from '@/hooks/useUserData';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'pt-BR' });

async function getDeviceSessionId(): Promise<string | null> {
  try {
    const { MercadoPagoInstance } = await import(
      '@mercadopago/sdk-react/esm/mercadoPago/initMercadoPago'
    );
    const mp = await MercadoPagoInstance.getInstance();
    const mpAny = mp as any;
    if (mpAny?.getDeviceId) {
      return await new Promise((resolve) => {
        mpAny.getDeviceId((id: string) => resolve(id));
      });
    }
  } catch {}
  return null;
}

type Step = 'form' | 'payment' | 'success';
type PaymentMethod = 'pix' | 'credit';

type FormData = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const FIELD_LABELS: Record<keyof FormData, string> = {
  name: 'Nome completo',
  email: 'E-mail',
  phone: 'Telefone',
  cpf: 'CPF',
  street: 'Rua',
  number: 'Número',
  complement: 'Complemento',
  neighborhood: 'Bairro',
  city: 'Cidade',
  state: 'UF',
  zip_code: 'CEP',
};

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim() || data.name.trim().length < 3) {
    errors.name = 'Nome completo é obrigatório (mínimo 3 caracteres)';
  }

  if (!data.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Informe um e-mail válido';
  }

  const digits = data.phone.replace(/\D/g, '');
  if (!digits || digits.length < 10) {
    errors.phone = 'Telefone é obrigatório (mínimo 10 dígitos)';
  }

  if (data.cpf) {
    const cpfDigits = data.cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      errors.cpf = 'CPF deve ter 11 dígitos';
    }
  }

  if (!data.street.trim()) errors.street = 'Rua é obrigatório';
  if (!data.number.trim()) errors.number = 'Número é obrigatório';
  if (!data.neighborhood.trim()) errors.neighborhood = 'Bairro é obrigatório';
  if (!data.city.trim()) errors.city = 'Cidade é obrigatório';

  const uf = data.state.trim().toUpperCase();
  if (!uf || !/^[A-Z]{2}$/.test(uf)) {
    errors.state = 'UF deve ter exatamente 2 letras';
  }

  const cepDigits = data.zip_code.replace(/\D/g, '');
  if (!cepDigits || cepDigits.length < 8) {
    errors.zip_code = 'CEP é obrigatório (mínimo 8 dígitos)';
  }

  return errors;
}

export default function CheckoutClient() {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
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
    name: '', email: '', phone: '', cpf: '',
    street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', zip_code: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [autoFilled, setAutoFilled] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name !== 'email') setAutoFilled(true);
    if (touched[name as keyof FormData]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name as keyof FormData];
        return next;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof FormData;
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldErrors = validateForm(form);
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleEmailBlur = async () => {
    setTouched(prev => ({ ...prev, email: true }));
    const fieldErrors = validateForm(form);
    if (fieldErrors.email) {
      setErrors(prev => ({ ...prev, email: fieldErrors.email }));
      return;
    }

    if (!form.email) return;
    try {
      const res = await fetch("/api/find-or-create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfileId(data.profile.id);

      if (!data.is_new) {
        setForm(prev => {
          const next = { ...prev };
          let changed = false;
          const p = data.profile;
          if (p.name && !prev.name) { next.name = p.name; changed = true; }
          if (p.phone && !prev.phone) { next.phone = p.phone; changed = true; }
          const addr = data.addresses?.[0];
          if (addr) {
            if (addr.street && !prev.street) { next.street = addr.street; changed = true; }
            if (addr.number && !prev.number) { next.number = addr.number; changed = true; }
            if (addr.complement && !prev.complement) { next.complement = addr.complement; changed = true; }
            if (addr.neighborhood && !prev.neighborhood) { next.neighborhood = addr.neighborhood; changed = true; }
            if (addr.city && !prev.city) { next.city = addr.city; changed = true; }
            if (addr.state && !prev.state) { next.state = addr.state; changed = true; }
            if (addr.zip_code && !prev.zip_code) { next.zip_code = addr.zip_code; changed = true; }
          }
          if (changed) setAutoFilled(true);
          return next;
        });
      }
    } catch {
      // ignore
    }
  };

  const getAddressPayload = () => ({
    street: form.street,
    number: form.number,
    complement: form.complement || "SEM COMPLEMENTO",
    neighborhood: form.neighborhood,
    city: form.city,
    state: form.state,
    zip_code: form.zip_code,
  });

  const handlePixSubmit = async () => {
    const validation = validateForm(form);
    setTouched({ name: true, email: true, phone: true, street: true, number: true, neighborhood: true, city: true, state: true, zip_code: true });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    setError('');

    const device_id = await getDeviceSessionId();

    let pid = profileId;
    if (!pid) {
      try {
        const r = await fetch("/api/find-or-create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, name: form.name, phone: form.phone }),
        });
        const d = await r.json();
        if (r.ok) { pid = d.profile.id; }
      } catch {}
    }

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
          address: getAddressPayload(),
          payment_method: 'pix',
          device_id,
          profile_id: pid,
          identification: form.cpf
            ? { type: "CPF", number: form.cpf.replace(/\D/g, "") }
            : null,
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
    const validation = validateForm(form);
    setTouched({ name: true, email: true, phone: true, street: true, number: true, neighborhood: true, city: true, state: true, zip_code: true });
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setError('Corrija os campos destacados antes de prosseguir');
      return;
    }

    setLoading(true);
    setError('');

    const device_id = await getDeviceSessionId();

    let pid = profileId;
    if (!pid) {
      try {
        const r = await fetch("/api/find-or-create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, name: form.name, phone: form.phone }),
        });
        const d = await r.json();
        if (r.ok) { pid = d.profile.id; }
      } catch {}
    }

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
          address: getAddressPayload(),
          payment_method: 'credit',
          card: {
            token: cardData.token,
            payment_method_id: cardData.payment_method_id,
            installments: cardData.installments,
          },
          device_id,
          profile_id: pid,
          identification: form.cpf
            ? { type: "CPF", number: form.cpf.replace(/\D/g, "") }
            : null,
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
      clearCart();
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
          clearCart();
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

      {step === 'success' && <SuccessScreen form={form} orderId={orderId} />}

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
        <div className="checkout-grid">
          <div>
            <h2 style={{ marginBottom: 24 }}>Informações de entrega</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InputField name="name" placeholder="Nome completo" value={form.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} touched={touched.name} />
                <InputField name="email" placeholder="E-mail" type="email" value={form.email} onChange={handleChange} onBlur={(e) => { handleBlur(e); handleEmailBlur(); }} error={errors.email} touched={touched.email} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InputField name="phone" placeholder="Telefone (WhatsApp)" value={form.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} touched={touched.phone} inputMode="numeric" />
                <InputField name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} onBlur={handleBlur} error={errors.cpf} touched={touched.cpf} inputMode="numeric" optional />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 16 }}>
                <InputField name="street" placeholder="Rua" value={form.street} onChange={handleChange} onBlur={handleBlur} error={errors.street} touched={touched.street} />
                <InputField name="number" placeholder="Número" value={form.number} onChange={handleChange} onBlur={handleBlur} error={errors.number} touched={touched.number} inputMode="numeric" />
              </div>
              <InputField name="complement" placeholder="Complemento (opcional)" value={form.complement} onChange={handleChange} onBlur={handleBlur} error={errors.complement} touched={touched.complement} optional />
              <InputField name="neighborhood" placeholder="Bairro" value={form.neighborhood} onChange={handleChange} onBlur={handleBlur} error={errors.neighborhood} touched={touched.neighborhood} />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
                <InputField name="city" placeholder="Cidade" value={form.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} touched={touched.city} />
                <InputField name="state" placeholder="UF" value={form.state} onChange={handleChange} onBlur={handleBlur} error={errors.state} touched={touched.state} maxLength={2} />
                <InputField name="zip_code" placeholder="CEP" value={form.zip_code} onChange={handleChange} onBlur={handleBlur} error={errors.zip_code} touched={touched.zip_code} inputMode="numeric" />
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

            {error && (
              <div style={{
                background: 'rgba(255,68,68,0.12)', border: '1px solid #ff4444',
                borderRadius: 8, padding: '12px 16px', marginBottom: 12,
                fontSize: 13, color: '#ff6b6b',
              }}>
                {error}
              </div>
            )}

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

function InputField({
  name, placeholder, value, onChange, onBlur, error, touched,
  type, inputMode, maxLength, optional,
}: {
  name: keyof FormData;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  type?: string;
  inputMode?: 'numeric' | 'tel';
  maxLength?: number;
  optional?: boolean;
}) {
  return (
    <div>
      <input
        name={name}
        placeholder={placeholder}
        type={type || 'text'}
        inputMode={inputMode || 'text'}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          ...inputStyle,
          borderColor: touched && error ? '#ff4444' : 'var(--glass-border)',
        }}
      />
      {touched && error && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff6b6b', lineHeight: 1.3 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessScreen({ form, orderId }: { form: FormData; orderId: number | null }) {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 15);
  const dd = String(deliveryDate.getDate()).padStart(2, '0');
  const mm = String(deliveryDate.getMonth() + 1).padStart(2, '0');
  const yyyy = deliveryDate.getFullYear();

  return (
    <div style={{ textAlign: 'center', padding: '20px 0', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Pagamento aprovado!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>
        <strong style={{ color: 'var(--text-primary)' }}>{form.name}</strong>, seu pedido <strong style={{ color: 'var(--neon-cyan)' }}>#{orderId}</strong> foi confirmado com sucesso.
      </p>
      <div style={{
        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
        borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left', fontSize: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Pedido</span>
          <span>#{orderId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Previsão de entrega</span>
          <span style={{ color: 'var(--neon-cyan)' }}>{dd}/{mm}/{yyyy}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Endereço de entrega</span>
          <span style={{ textAlign: 'right', maxWidth: '55%' }}>{form.street}, {form.number} - {form.neighborhood}, {form.city}/{form.state}</span>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Enviamos um e-mail para <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong> confirmando seu pedido.
        Neste e-mail você tem um link para confirmar o seu endereço e criar uma senha para acessar o sistema futuramente!
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 28 }}>
        Obrigado por mais esse pedido!
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/#produtos" className="checkout-btn" style={{ display: 'inline-block', width: 'auto', padding: '14px 32px', textDecoration: 'none', fontSize: 13 }}>
          CONTINUAR COMPRANDO
        </Link>
        <Link href="/app/pedidos" style={{ display: 'inline-block', width: 'auto', padding: '14px 32px', textDecoration: 'none', fontSize: 13, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--neon-cyan)', transition: 'var(--transition)', textAlign: 'center' }}>
          IR PARA ÁREA DE CLIENTES
        </Link>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)', color: 'inherit', fontSize: 15, outline: 'none',
  boxSizing: 'border-box',
};
