import { supabaseServer } from "@/lib/supabase-server";
import { TopProductsChart, CategoryPieChart } from "@/components/admin/AdminCharts";

export const dynamic = "force-dynamic";

async function getData() {
  const [cats, prods, allOrders, paidOrders, profiles, orderItems] = await Promise.all([
    supabaseServer.from("categories").select("*", { count: "exact", head: true }),
    supabaseServer.from("products").select("*", { count: "exact", head: true }),
    supabaseServer.from("orders").select("*", { count: "exact", head: true }),
    supabaseServer.from("orders").select("total").eq("status", "paid"),
    supabaseServer.from("profiles").select("*", { count: "exact", head: true }),
    supabaseServer.from("order_items").select("quantity, unit_price, products(name, categories(name))"),
  ]);

  const totalRevenue = (paidOrders.data ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const totalCustomers = profiles.count ?? 0;

  const topProducts: { name: string; qty: number }[] = [];
  const categorySales: Record<string, number> = {};

  for (const item of orderItems.data ?? []) {
    const prod = item.products as unknown as { name: string; categories: { name: string } | null } | null;
    const qty = Number(item.quantity);
    if (prod) {
      const existing = topProducts.find(p => p.name === prod.name);
      if (existing) existing.qty += qty;
      else topProducts.push({ name: prod.name, qty });

      const catName = prod.categories?.name ?? "Sem categoria";
      categorySales[catName] = (categorySales[catName] ?? 0) + qty;
    }
  }

  topProducts.sort((a, b) => b.qty - a.qty);

  return {
    totalCategories: cats.count ?? 0,
    totalProducts: prods.count ?? 0,
    totalOrders: allOrders.count ?? 0,
    totalRevenue,
    totalCustomers,
    topProducts: topProducts.slice(0, 10),
    categorySales: Object.entries(categorySales).map(([name, qty]) => ({ name, qty })),
  };
}

export default async function AdminDashboard() {
  const data = await getData();

  return (
    <>
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>Dashboard</h1>

      <div className="admin-grid-4">
        <div className="admin-card">
          <div className="admin-stat-label">Produtos</div>
          <div className="admin-stat-value">{data.totalProducts}</div>
        </div>
        <div className="admin-card">
          <div className="admin-stat-label">Categorias</div>
          <div className="admin-stat-value">{data.totalCategories}</div>
        </div>
        <div className="admin-card">
          <div className="admin-stat-label">Pedidos</div>
          <div className="admin-stat-value">{data.totalOrders}</div>
        </div>
        <div className="admin-card">
          <div className="admin-stat-label">Receita</div>
          <div className="admin-stat-value">R$ {data.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="admin-card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Produtos mais vendidos</h3>
          <TopProductsChart data={data.topProducts} />
        </div>
        <div className="admin-card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Vendas por categoria</h3>
          <CategoryPieChart data={data.categorySales} />
        </div>
      </div>
    </>
  );
}
