import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase-auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/images/AEL.png" alt="AEL Store" style={{ maxWidth: 140, height: "auto" }} />
        </div>
        <nav>
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin/produtos">Produtos</Link>
          <Link href="/admin/categorias">Categorias</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
          <Link href="/">Ver loja</Link>
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: 12, padding: "0 20px 20px" }}>
          {user && (
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {user.email}
            </div>
          )}
          <LogoutButton />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
