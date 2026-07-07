"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const redirect = params.get("redirect") || "/admin/dashboard";
  const errorParam = params.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    if (isSignup) {
      const { error: signupErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${redirect}` },
      });
      if (signupErr) {
        setError(signupErr.message);
        setLoading(false);
        return;
      }
      setError("Cadastro realizado! Verifique seu e-mail.");
      setLoading(false);
      return;
    }

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr) {
      setError(loginErr.message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/user-role");
    const { role } = await res.json();

    router.push(role === "admin" ? "/admin/dashboard" : "/app/pedidos");
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-primary)", padding: 20,
    }}>
      <div style={{
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        borderRadius: 16, padding: 40, width: "100%", maxWidth: 400,
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <img src="/images/AEL.png" alt="AEL Store" style={{ maxWidth: 180, height: "auto" }} />
        </div>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 32, fontSize: 14 }}>
          {isSignup ? "Criar nova conta" : "Acessar sua conta"}
        </p>

        {errorParam === "acesso_negado" && (
          <p style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 16, textAlign: "center", background: "rgba(255,68,68,0.1)", padding: "10px 14px", borderRadius: 8 }}>
            Acesso negado. Você não tem permissão para acessar esta área.
          </p>
        )}

        {error && (
          <p style={{ color: error.includes("Verifique") ? "#51cf66" : "#ff6b6b", fontSize: 13, marginBottom: 16, textAlign: "center", background: error.includes("Verifique") ? "rgba(81,207,102,0.1)" : "rgba(255,68,68,0.1)", padding: "10px 14px", borderRadius: 8 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <input type="email" placeholder="E-mail" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={inputStyle} />
          <input type="password" placeholder="Senha" value={password}
            onChange={e => setPassword(e.target.value)} required minLength={6}
            style={inputStyle} />
          <button type="submit" disabled={loading}
            className="checkout-btn" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "AGUARDE..." : isSignup ? "CADASTRAR" : "ENTRAR"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-secondary)" }}>
          {isSignup ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button onClick={() => { setIsSignup(!isSignup); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--neon-cyan)", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
            {isSignup ? "Entrar" : "Cadastrar"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 8,
  border: "1px solid var(--glass-border)", background: "var(--glass-bg)",
  color: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box",
};
