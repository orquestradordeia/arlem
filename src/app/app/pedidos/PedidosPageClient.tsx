'use client';

import Link from 'next/link';

interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total: number;
  products: { name: string } | null;
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  mp_payment_id: string | null;
  order_items: OrderItem[];
}

interface Profile {
  name: string | null;
  phone: string | null;
  email: string;
}

interface Address {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface PedidosPageClientProps {
  profile: Profile;
  address: Address | null;
  orders: Order[];
}

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColor: Record<string, string> = {
  pending: 'var(--neon-gold)',
  paid: '#51cf66',
  preparing: 'var(--neon-cyan)',
  shipped: 'var(--neon-purple)',
  delivered: '#51cf66',
  cancelled: '#ff4444',
};

export default function PedidosPageClient({ profile, address, orders }: PedidosPageClientProps) {
  function handleTrack(orderId: number) {
    alert(`Rastreamento para o pedido #${orderId}:\nSeu sneaker já foi postado! Código de rastreio fictício: AL${orderId}BR. Previsão de entrega mantida.`);
  }

  function handleInvoice(orderId: number) {
    alert(`Preparando download da Nota Fiscal para o pedido #${orderId}...\nNota_Fiscal_Pedido_${orderId}.pdf gerada com sucesso!`);
  }

  function handleDetails(order: Order) {
    const itemsText = order.order_items
      .map(i => `- ${i.quantity}x ${i.products?.name || 'Sneaker'} (R$ ${Number(i.unit_price).toFixed(2).replace('.', ',')})`)
      .join('\n');
    alert(`Detalhes do pedido #${order.id}:\n\nItens:\n${itemsText}\n\nTotal: R$ ${Number(order.total).toFixed(2).replace('.', ',')}\nStatus: ${statusLabel[order.status] ?? order.status}`);
  }

  return (
    <>
      <h1 className="pedidos-title">Minha Conta</h1>

      {/* Grid of Profile / Address cards */}
      <div className="pedidos-grid">
        <div className="pedidos-card">
          <h3>Dados Pessoais</h3>
          <div className="pedidos-card-info">
            <div className="pedidos-info-row">
              <span className="pedidos-info-label">Nome</span>
              <span className="pedidos-info-value">{profile.name || 'Não cadastrado'}</span>
            </div>
            <div className="pedidos-info-row">
              <span className="pedidos-info-label">E-mail</span>
              <span className="pedidos-info-value">{profile.email}</span>
            </div>
            <div className="pedidos-info-row">
              <span className="pedidos-info-label">Telefone</span>
              <span className="pedidos-info-value">{profile.phone || 'Não cadastrado'}</span>
            </div>
          </div>
        </div>

        <div className="pedidos-card">
          <h3>Endereço de Entrega</h3>
          {address ? (
            <div className="pedidos-card-info">
              <div className="pedidos-info-row">
                <span className="pedidos-info-label">Rua / Nº</span>
                <span className="pedidos-info-value">
                  {address.street}, {address.number}
                  {address.complement ? ` (${address.complement})` : ''}
                </span>
              </div>
              <div className="pedidos-info-row">
                <span className="pedidos-info-label">Bairro</span>
                <span className="pedidos-info-value">{address.neighborhood}</span>
              </div>
              <div className="pedidos-info-row">
                <span className="pedidos-info-label">CEP</span>
                <span className="pedidos-info-value">{address.zip_code}</span>
              </div>
              <div className="pedidos-info-row">
                <span className="pedidos-info-label">Cidade / UF</span>
                <span className="pedidos-info-value">{address.city} / {address.state}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Nenhum endereço cadastrado ainda.
            </div>
          )}
        </div>
      </div>

      {/* Orders List Section */}
      <div className="pedidos-section-title">Histórico de Pedidos</div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            Você ainda não realizou nenhuma compra.
          </p>
          <Link href="/#produtos" className="checkout-btn" style={{ display: 'inline-block', padding: '12px 32px', textDecoration: 'none' }}>
            VER PRODUTOS
          </Link>
        </div>
      ) : (
        <div className="pedidos-list">
          {orders.map(order => (
            <div key={order.id} className="pedido-item-card">
              <div className="pedido-meta">
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div className="pedido-id-group">
                    <span className="pedido-id-label">ID Interno</span>
                    <span className="pedido-id-value">#{order.id}</span>
                  </div>
                  <div className="pedido-id-group">
                    <span className="pedido-id-label">ID Mercado Pago</span>
                    <span className="pedido-id-value" style={{ fontFamily: 'monospace', fontSize: 13, color: order.mp_payment_id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {order.mp_payment_id || 'Não integrado'}
                    </span>
                  </div>
                  <div className="pedido-id-group">
                    <span className="pedido-id-label">Data do Pedido</span>
                    <span className="pedido-id-value" style={{ fontWeight: 'normal', fontSize: 14 }}>
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <span
                  className="pedido-status-badge"
                  style={{
                    color: statusColor[order.status] ?? 'var(--text-secondary)',
                    background: `${statusColor[order.status] ?? 'var(--text-secondary)'}15`,
                    border: `1px solid ${statusColor[order.status] ?? 'var(--text-secondary)'}30`,
                  }}
                >
                  {statusLabel[order.status] ?? order.status}
                </span>
              </div>

              {/* Order Products list */}
              <div className="pedido-products">
                {order.order_items.map((item, i) => (
                  <div key={i} className="pedido-prod-row">
                    <span className="pedido-prod-name">
                      {item.products?.name || 'Sneaker'}
                      {item.quantity > 1 ? ` x${item.quantity}` : ''}
                    </span>
                    <span style={{ fontFamily: 'Courier New, monospace' }}>
                      R$ {Number(item.total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order footer actions */}
              <div className="pedido-footer">
                <div className="pedido-total-box">
                  <span className="pedido-total-label">Total Pago</span>
                  <span className="pedido-total-val">
                    R$ {Number(order.total).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="pedido-actions">
                  <button
                    className="pedido-btn"
                    onClick={() => handleDetails(order)}
                  >
                    Ver Detalhes
                  </button>
                  <button
                    className="pedido-btn"
                    onClick={() => handleTrack(order.id)}
                    disabled={order.status === 'cancelled' || order.status === 'pending'}
                    style={{
                      opacity: order.status === 'cancelled' || order.status === 'pending' ? 0.4 : 1,
                      cursor: order.status === 'cancelled' || order.status === 'pending' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Rastrear
                  </button>
                  <button
                    className="pedido-btn pedido-btn-primary"
                    onClick={() => handleInvoice(order.id)}
                    disabled={order.status !== 'paid' && order.status !== 'preparing' && order.status !== 'shipped' && order.status !== 'delivered'}
                    style={{
                      opacity: (order.status !== 'paid' && order.status !== 'preparing' && order.status !== 'shipped' && order.status !== 'delivered') ? 0.4 : 1,
                      cursor: (order.status !== 'paid' && order.status !== 'preparing' && order.status !== 'shipped' && order.status !== 'delivered') ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Ver Nota Fiscal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
