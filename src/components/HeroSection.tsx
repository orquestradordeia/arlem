'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  { src: '/images/slides/slide-01.png', priority: true },
  { src: '/images/slides/slide-02.webp', priority: false },
  { src: '/images/slides/slide-04.png', priority: false },
  { src: '/images/slides/slide-02.webp', priority: false },
];

export default function HeroSection() {
  const innerRef = useRef<HTMLDivElement>(null);
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
          {slides.map((slide, i) => (
            <div className="hero-slide-bg" key={i} style={{ position: 'relative' }}>
              {/* Next/Image: auto-converts PNG→AVIF/WebP, handles srcset & preload */}
              <Image
                src={slide.src}
                alt=""
                fill
                priority={slide.priority}
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                quality={85}
              />
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
          {/* Logo also optimized — from 764 KB PNG → ~60 KB AVIF */}
          <Image
            src="/images/AEL.png"
            alt="Store"
            width={220}
            height={120}
            priority
            quality={90}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="btn-group">
          <Link href="/#produtos" className="btn-primary">VER COLEÇÃO</Link>
          <a href="#" className="btn-outline">SAIBA MAIS</a>
        </div>
      </div>
      <div className="scroll-indicator">&#8595; Role</div>
    </section>
  );
}
