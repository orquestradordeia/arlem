import React from 'react';

export default function Newsletter() {
  return (
    <section className="newsletter-section">
      <div className="container">
        <h2>FIQUE POR DENTRO</h2>
        <p>Receba ofertas exclusivas e lançamentos primeiro</p>
        <form className="newsletter-form" onSubmit={e => { e.preventDefault(); alert('Inscrito com sucesso!') }}>
          <input type="email" placeholder="Seu melhor e-mail" required />
          <button type="submit">INSCREVER</button>
        </form>
      </div>
    </section>
  );
}
