'use client';

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div style={{
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        borderRadius: 12, padding: 32, textAlign: "center",
      }}>
        <p style={{ color: "var(--neon-cyan)", fontSize: 16, fontWeight: 600 }}>
          Mensagem enviada com sucesso!
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
          Responderemos em breve pelo e-mail informado.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      style={{ display: "grid", gap: 14 }}>
      <input name="name" placeholder="Seu nome" required
        className="admin-input" style={{ width: "100%", boxSizing: "border-box" }} />
      <input name="email" type="email" placeholder="Seu e-mail" required
        className="admin-input" style={{ width: "100%", boxSizing: "border-box" }} />
      <textarea name="message" placeholder="Sua mensagem" rows={5} required
        className="admin-input" style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }} />
      <button type="submit" className="checkout-btn" style={{ width: "100%", padding: "14px 0" }}>
        ENVIAR MENSAGEM
      </button>
    </form>
  );
}
