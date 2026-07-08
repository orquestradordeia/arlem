'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  badge: string;
}

export default function ProductGallery({ images, badge }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="gallery-main" style={{ position: 'relative' }}>
        <div className="badge">{badge}</div>
        <div className="glow"></div>
        {/* Main image: priority so it loads immediately as product LCP element */}
        <Image
          src={images[active]}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'contain' }}
          quality={85}
        />
      </div>
      <div className="gallery-thumbs">
        {images.map((img, i) => (
          <div
            className={`thumb${i === active ? ' active' : ''}`}
            key={i}
            onClick={() => setActive(i)}
            style={{ position: 'relative' }}
          >
            <Image
              src={img}
              alt=""
              fill
              sizes="80px"
              style={{ objectFit: 'cover' }}
              quality={70}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
