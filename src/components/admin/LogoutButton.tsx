"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} style={{
      background: "none", border: "1px solid var(--glass-border)", color: "var(--text-secondary)",
      padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, width: "100%",
      textAlign: "center", transition: "var(--transition)",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff4444"; e.currentTarget.style.color = "#ff4444"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
      Sair
    </button>
  );
}
