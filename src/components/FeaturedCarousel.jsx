import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./FeaturedCarousel.css";

export default function FeaturedCarousel({ articles }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    if (articles.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 6000);

    return () => clearInterval(timerRef.current);
  }, [articles.length]);

  if (articles.length === 0) return null;

  function goToPrevious() {
    setIndex((prev) => (prev - 1 + articles.length) % articles.length);
  }

  function goToNext() {
    setIndex((prev) => (prev + 1) % articles.length);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    touchEndX.current = e.changedTouches[0].clientX;

    const distance = touchStartX.current - touchEndX.current;

    // Evita cambios por pequeños movimientos
    if (Math.abs(distance) < 50) return;

    if (distance > 0) {
      // Deslizó hacia la izquierda
      goToNext();
    } else {
      // Deslizó hacia la derecha
      goToPrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  return (
    <div
      className="featured-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {articles.map((article, i) => (
        <Link
          key={article.id}
          to={`/noticia/${article.slug}`}
          className={`featured-slide ${i === index ? "is-active" : ""}`}
        >
          <img src={article.cover_image} alt={article.title} />

          <div className="featured-body">
            <span className="featured-category">{article.category}</span>

            <h1>{article.title}</h1>

            <p>{article.excerpt}</p>
          </div>
        </Link>
      ))}

      {articles.length > 1 && (
        <>
          {/* Flecha anterior */}
          <button
            className="featured-arrow featured-arrow-prev"
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            aria-label="Noticia anterior"
          >
            ‹
          </button>

          {/* Flecha siguiente */}
          <button
            className="featured-arrow featured-arrow-next"
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            aria-label="Noticia siguiente"
          >
            ›
          </button>

          {/* Indicadores */}
          <div className="featured-dots">
            {articles.map((_, i) => (
              <button
                key={i}
                className={i === index ? "is-active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setIndex(i);
                }}
                aria-label={`Ir a noticia ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
