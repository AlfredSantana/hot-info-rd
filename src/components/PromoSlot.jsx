import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PromoSlot.css";

export default function PromoSlot({ items, aspectRatio = "21 / 9" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const current = items[index];

  // Detecta si el archivo es un video
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(current.image);

  const content = isVideo ? (
    <video
      src={current.image}
      className="promo-slot-image"
      autoPlay
      muted
      loop
      playsInline
      aria-label={current.alt || "Promoción"}
    />
  ) : (
    <img
      src={current.image}
      alt={current.alt || "Promoción"}
      className="promo-slot-image"
    />
  );

  return (
    <div className="promo-wrapper">
      <span className="promo-label">Anuncio</span>

      <div className="promo-slot" style={{ aspectRatio }}>
        {current.link ? (
          current.link.startsWith("http") ? (
            <a href={current.link} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <Link to={current.link}>{content}</Link>
          )
        ) : (
          content
        )}

        {items.length > 1 && (
          <div className="promo-slot-dots">
            {items.map((_, i) => (
              <span key={i} className={i === index ? "is-active" : ""} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
