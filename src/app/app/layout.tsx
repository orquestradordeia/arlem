import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <Link href="/" style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--neon-cyan)", textDecoration: "none", letterSpacing: 2 }}>
          STORE
        </Link>
        <nav style={{ display: "flex", gap: 24, fontSize: 14 }}>
          <Link href="/app/pedidos" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Meus Pedidos</Link>
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Loja</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
