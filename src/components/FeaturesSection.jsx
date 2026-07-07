import React from 'react';

const features = [
  { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', title: 'FRETE GRÁTIS', desc: 'Para todo o Brasil' },
  { icon: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z', title: 'PARCELAMENTO', desc: 'Em até 4x sem juros' },
  { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', title: 'TROCAS', desc: 'Em até 7 dias' },
  { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', title: '5% OFF VIA PIX', desc: 'Desconto especial' },
];

export default function FeaturesSection() {
  return (
    <section className="features">
      <div className="container">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="icon"><svg viewBox="0 0 24 24"><path d={f.icon} /></svg></div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
