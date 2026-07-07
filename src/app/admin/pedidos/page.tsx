import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColor: Record<string, string> = {
  pending: "var(--neon-gold)",
  paid: "#51cf66",
  preparing: "var(--neon-cyan)",
  shipped: "var(--neon-purple)",
  delivered: "#51cf66",
  cancelled: "#ff4444",
};

async function getOrders() {
  const { data } = await supabaseServer
    .from("orders")
    .select("id, total, status, created_at, profile_id, mp_payment_id, order_items(product_id, quantity, unit_price, total, products(name))")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminPedidos() {
  const orders = await getOrders();

  return (
    <>
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>Pedidos</h1>

      {orders.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: 40 }}>
          Nenhum pedido ainda.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map(order => (
            <div key={order.id} style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Pedido #{order.id}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Cliente: {order.profile_id?.slice(0, 8) ?? "—"}
                  </span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
                  color: statusColor[order.status] ?? "var(--text-secondary)",
                  background: `${statusColor[order.status] ?? "var(--text-secondary)"}20`,
                }}>
                  {statusLabel[order.status] ?? order.status}
                </span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {(order.order_items ?? []).map((item, i) => {
                  const prod = item.products as unknown as { name: string } | null;
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span>{item.quantity}x {prod?.name ?? `Produto #${item.product_id}`}</span>
                      <span>R$ {Number(item.total).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, textAlign: "right", fontSize: 15, fontFamily: "var(--font-display)" }}>
                Total: R$ {Number(order.total).toFixed(2)}
              </div>
              {order.mp_payment_id && (
                <div style={{ marginTop: 4, textAlign: "right", fontSize: 12, color: "var(--text-secondary)" }}>
                  MP ID: {order.mp_payment_id}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
