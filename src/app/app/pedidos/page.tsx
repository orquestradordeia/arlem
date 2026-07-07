import { getCurrentUser } from "@/lib/supabase-auth";
import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getOrders(userId: string) {
  const { data } = await supabaseServer
    .from("orders")
    .select("id, total, status, created_at, mp_payment_id, order_items(product_id, quantity, unit_price, total, products(name))")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

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

export default async function MeusPedidos() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await getOrders(user.id);

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <h2 style={{ marginBottom: 12 }}>Nenhum pedido ainda</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Você ainda não realizou nenhuma compra.
        </p>
        <Link href="/#produtos" className="checkout-btn" style={{ display: "inline-block", padding: "12px 32px", textDecoration: "none" }}>
          VER PRODUTOS
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>Meus Pedidos</h1>
      <div style={{ display: "grid", gap: 16 }}>
        {orders.map(order => (
          <div key={order.id} style={{
            background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Pedido #{order.id}</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 16 }}>
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
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
            <div style={{ display: "grid", gap: 8 }}>
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
          </div>
        ))}
      </div>
    </>
  );
}
