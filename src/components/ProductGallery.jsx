import React, { useState } from 'react';

export default function ProductGallery({ images, badge }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="gallery-main">
        <div className="badge">{badge}</div>
        <div className="glow"></div>
        <img src={images[active]} alt="" style={{ opacity: 1 }} />
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
