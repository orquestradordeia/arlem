import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminProdutos() {
  const { data: produtos } = await supabaseServer
    .from("products")
    .select("id, name, price, active, featured, categories(name)")
    .order("id");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Produtos</h1>
        <Link href="/admin/produtos/novo" className="admin-btn">+ Novo Produto</Link>
      </div>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Destaque</th><th>Ativo</th><th></th></tr>
          </thead>
          <tbody>
            {(produtos ?? []).map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{(p.categories as unknown as { name: string })?.name ?? "-"}</td>
                <td>R$ {Number(p.price).toFixed(2)}</td>
                <td>{p.featured ? "Sim" : "Não"}</td>
                <td>{p.active ? "Sim" : "Não"}</td>
                <td><Link href={`/admin/produtos/${p.id}`} className="admin-btn admin-btn-sm admin-btn-outline">Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
