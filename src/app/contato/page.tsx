import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contato | AEL Store",
};

const faq = [
  {
    q: "Quanto tempo leva para meu pedido chegar?",
    a: "Nosso prazo de entrega varia de acordo com a sua localização. Para entregas fora de Manaus-AM, o prazo estimado é de 15 a 40 dias úteis. Para clientes dentro de Manaus-AM, produtos que estão em estoque costumam ser entregues em até 48 horas após a confirmação do pagamento.",
  },
  {
    q: "Vocês enviam para todo o Brasil?",
    a: "Sim! Enviamos para todos os estados brasileiros. O prazo de entrega pode variar conforme a região, sendo mais rápido para capitais e regiões próximas a Manaus.",
  },
  {
    q: "Como funciona a política de trocas e devoluções?",
    a: "Você tem até 7 dias após o recebimento do produto para solicitar troca ou devolução. Caso não fique satisfeito, entre em contato conosco pelo WhatsApp ou e-mail que resolveremos da melhor forma possível. Clientes insatisfeitos também podem receber brindes especiais como forma de compensação.",
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "Aceitamos Pix (com 5% de desconto) e Cartão de Crédito em até 4x sem juros. Todas as transações são processadas de forma segura via Mercado Pago.",
  },
  {
    q: "Os produtos são originais?",
    a: "Sim! Trabalhamos apenas com produtos originais e importados diretamente de fornecedores internacionais. Cada item passa por uma rigorosa curadoria antes de ser disponibilizado em nosso catálogo.",
  },
  {
    q: "Como posso acompanhar meu pedido?",
    a: "Assim que seu pedido for despachado, enviaremos o código de rastreamento por e-mail e WhatsApp. Você também pode consultar o status na área do cliente em nosso site.",
  },
  {
    q: "Vocês têm desconto para primeira compra?",
    a: "Sim! Oferecemos 5% de desconto no pagamento via Pix para todos os pedidos. Fique de olho também nas nossas redes sociais para promoções relâmpago e cupons exclusivos.",
  },
];

export default function ContatoPage() {
  return (
    <div className="container" style={{ padding: "80px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--neon-cyan)", marginBottom: 8 }}>
          Contato
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 40 }}>
          Tire suas dúvidas ou entre em contato com a gente
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 60 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--neon-cyan)", marginBottom: 20 }}>
              Envie sua mensagem
            </h2>
            <ContactForm />
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--neon-cyan)", marginBottom: 20 }}>
              Fale conosco
            </h2>
            <div style={{ display: "grid", gap: 16, marginBottom: 28 }}>
              <div style={{
                background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                borderRadius: 12, padding: 20,
              }}>
                <h3 style={{ fontSize: 14, color: "var(--neon-cyan)", marginBottom: 12 }}>WhatsApp</h3>
                <p style={{ fontSize: 15, marginBottom: 12 }}>(92) 98475-9201</p>
                <a href="https://wa.me/5592984759201" target="_blank" rel="noopener noreferrer"
                  className="checkout-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", fontSize: 13, padding: "12px 24px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  FALAR NO WHATSAPP
                </a>
              </div>

              <div style={{
                background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                borderRadius: 12, padding: 20,
              }}>
                <h3 style={{ fontSize: 14, color: "var(--neon-cyan)", marginBottom: 12 }}>Redes Sociais</h3>
                <div style={{ display: "flex", gap: 20 }}>
                  <a href="https://instagram.com/aelstore" target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 01-1.25 1.25A1.25 1.25 0 0114.75 5.5a1.25 1.25 0 012.5 0M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z"/></svg>
                    @aelstore
                  </a>
                  <a href="https://facebook.com/aelstore" target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10.02-10.02z"/></svg>
                    @aelstore
                  </a>
                  <a href="https://tiktok.com/@aelstore" target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                    @aelstore
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--neon-cyan)", marginBottom: 24 }}>
          Perguntas Frequentes
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {faq.map((item, i) => (
            <details key={i} style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 10, padding: "16px 20px", cursor: "pointer",
            }}>
              <summary style={{
                fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
                color: "var(--neon-cyan)", outline: "none",
              }}>
                {item.q}
              </summary>
              <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
