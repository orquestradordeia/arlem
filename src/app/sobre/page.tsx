import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nós | ALL Shops",
};

export default function SobrePage() {
  return (
    <div className="container" style={{ padding: "80px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--neon-cyan)", marginBottom: 8 }}>
        Sobre Nós
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 40 }}>
        Conheça a história e os valores por trás da AEL Store
      </p>

      <div style={{ display: "grid", gap: 32, fontSize: 15, lineHeight: 1.8, color: "var(--text-primary)" }}>
        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--neon-cyan)", marginBottom: 12 }}>
            Nossa História
          </h2>
          <p>
            A <strong>AEL Store</strong> nasceu de um sonho simples, mas ambicioso: democratizar o acesso a produtos
            internacionais de qualidade no Brasil. Cansados de ver brasileiros pagando preços abusivos por produtos
            importados, ou tendo que recorrer a plataformas complicadas e cheias de taxas para conseguir artigos
            diferenciados, decidimos criar uma loja que unisse o melhor dos dois mundos — variedade global com
            atendimento local.
          </p>
          <p>
            Fundada em 2024, a AEL Store é o resultado da paixão por sneakers, streetwear e estilo de vida premium.
            Desde o primeiro dia, nossa missão foi clara: oferecer produtos que dificilmente são vistos nas lojas
            tradicionais brasileiras, a um preço justo e competitivo, sem abrir mão da qualidade e da excelência no
            atendimento ao cliente.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--neon-cyan)", marginBottom: 12 }}>
            Nossa Missão
          </h2>
          <p>
            Facilitar o acesso dos brasileiros a produtos internacionais autênticos e de alta qualidade, oferecendo
            uma experiência de compra premium, transparente e sem complicações. Queremos que cada cliente se sinta
            especial, desde o momento em que navega em nosso site até o instante em que recebe seu pedido em casa.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--neon-cyan)", marginBottom: 12 }}>
            O Que Nos Torna Diferentes
          </h2>
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--neon-cyan)", marginBottom: 6 }}>
                Seleção Curada de Produtos
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                Não trabalhamos com qualquer produto. Cada item do nosso catálogo é cuidadosamente selecionado
                por nossa equipe, que busca as melhores marcas e os lançamentos mais relevantes do mercado
                internacional. Nosso objetivo é trazer até você o que há de melhor em sneakers e streetwear,
                com curadoria que garante originalidade e estilo.
              </p>
            </div>
            <div style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--neon-cyan)", marginBottom: 6 }}>
                Preço Justo
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                Acreditamos que preço justo não é sinônimo de preço baixo, e sim de transparência. Nossos valores
                são calculados de forma honesta, considerando todos os custos envolvidos na importação, sem margens
                abusivas. Você paga um valor justo pelo produto e pela qualidade do serviço que entregamos.
              </p>
            </div>
            <div style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--neon-cyan)", marginBottom: 6 }}>
                Entrega Rápida e com Qualidade
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                Sabemos que a ansiedade pós-compra é real. Por isso, trabalhamos com parceiros logísticos
                de confiança para garantir que seu pedido chegue no prazo e em perfeitas condições. Cada
                embalagem é preparada com cuidado, como se fosse um presente, porque para nós, é.
              </p>
            </div>
            <div style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--neon-cyan)", marginBottom: 6 }}>
                Relacionamento com o Cliente
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                Este é o nosso principal pilar. Aqui na AEL Store, não tratamos nossos clientes como números.
                Cada pessoa que compra conosco é tratada de forma premium, com atendimento personalizado e
                humanizado. Não é por acaso que nossa política de trocas é uma das mais generosas do mercado:
                oferecemos até 7 dias para trocas e devoluções, porque confiamos na qualidade dos nossos
                produtos e queremos que você fique satisfeito.
              </p>
            </div>
            <div style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--neon-cyan)", marginBottom: 6 }}>
                Brindes e Surpresas
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                Cliente satisfeito é cliente que volta. E para mostrar nossa gratidão, temos o hábito de
                enviar brindes especiais junto com os pedidos — especialmente para aqueles clientes que,
                por algum motivo, não ficaram 100% satisfeitos com sua compra. É a nossa forma de dizer
                que nos importamos e que estamos sempre trabalhando para melhorar.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--neon-cyan)", marginBottom: 12 }}>
            Nossos Valores
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            {[
              { label: "Transparência", desc: "Em cada etapa, do preço à entrega." },
              { label: "Qualidade", desc: "Produtos autênticos e selecionados com cuidado." },
              { label: "Respeito", desc: "Ao cliente, ao produto e ao meio ambiente." },
              { label: "Inovação", desc: "Buscando sempre o que há de melhor no mercado." },
              { label: "Empatia", desc: "Colocando-nos no lugar do cliente em cada decisão." },
              { label: "Excelência", desc: "No atendimento e na experiência de compra." },
            ].map(v => (
              <div key={v.label} style={{
                background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                borderRadius: 10, padding: 16,
              }}>
                <strong style={{ color: "var(--neon-cyan)", fontSize: 13 }}>{v.label}</strong>
                <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: 13 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
          borderRadius: 12, padding: 24, textAlign: "center",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--neon-cyan)", marginBottom: 12 }}>
            Vem fazer parte da nossa história
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            A AEL Store é mais do que uma loja — é uma comunidade de pessoas que valorizam estilo, qualidade e
            bom atendimento. Explore nosso catálogo, encontre o sneaker dos seus sonhos e descubra por que
            nossos clientes voltam sempre. Seja bem-vindo à família AEL Store.
          </p>
        </section>
      </div>
    </div>
  );
}
