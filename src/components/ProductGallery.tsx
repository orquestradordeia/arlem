'use client';

import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  badge: string;
}

export default function ProductGallery({ images, badge }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="gallery-main">
        <div className="badge">{badge}</div>
        <div className="glow"></div>
        <img src={images[active]} alt="" />
      </div>
      <div className="gallery-thumbs">
        {images.map((img, i) => (
          <div
            className={`thumb${i === active ? ' active' : ''}`}
            key={i}
            onClick={() => setActive(i)}
          >
            <img src={img} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}
