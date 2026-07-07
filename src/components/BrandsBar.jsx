import React from 'react';

const brands = ['NIKE', 'ADIDAS', 'NEW BALANCE', 'AIR JORDAN', 'PUMA', 'ONITSUKA'];

export default function BrandsBar() {
  return (
    <section className="brands-bar">
      <div className="container">
        {brands.map((b, i) => (
          <span className="brand-item" key={i}>{b}</span>
        ))}
      </div>
    </section>
  );
}
