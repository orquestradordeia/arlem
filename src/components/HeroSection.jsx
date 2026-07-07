import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  '/images/slides/slide-01.png',
  '/images/slides/slide-02.png',
  '/images/slides/slide-04.png',
  '/images/slides/slide-02.webp',
];

export default function HeroSection() {
  const innerRef = useRef(null);
  const slideRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      slideRef.current = (slideRef.current + 1) % slides.length;
      if (innerRef.current) {
        innerRef.current.style.transform = `translateX(-${slideRef.current * 100}%)`;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="brand-hero" id="heroSection">
      <div className="hero-slideshow">
        <div className="hero-slideshow-inner" ref={innerRef}>
          {slides.map((src, i) => (
            <div className="hero-slide-bg" key={i}>
              <img src={src} alt="" />
              <div className="backdrop"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid-lines"></div>
      <div className="brand-hero-content">
        <div className="tagline">Premium Streetwear</div>
        <div className="logo-hero">
          <div className="ring"></div>
          <div className="ring"></div>
          <div className="ring"></div>
          <img src="/images/AEL.png" alt="A&L Store" />
        </div>
        <div className="btn-group">
          <Link to="/#produtos" className="btn-primary">VER COLEÇÃO</Link>
          <a href="#" className="btn-outline">SAIBA MAIS</a>
        </div>
      </div>
      <div className="scroll-indicator">&#8595; Role</div>
    </section>
  );
}
