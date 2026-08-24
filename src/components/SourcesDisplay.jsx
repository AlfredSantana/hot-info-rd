import { useEffect, useRef, useState } from "react";
import "./SourcesDisplay.css";
import Lightbox from "./Lightbox.jsx";

function LinkPreviewCard({ url }) {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    let active = true;
    fetch(`/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setPreview(data);
      })
      .catch(() => {
        if (active) setPreview(null);
      });
    return () => {
      active = false;
    };
  }, [url]);

  let domain = "";
  try {
    domain = new URL(url).hostname.replace("www.", "");
  } catch {
    /* ignore */
  }

  if (preview === undefined) {
    return (
      <div className="source-slide source-card source-card-loading">
        Cargando…
      </div>
    );
  }

  if (!preview || !preview.ok) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="source-slide source-card source-card-fallback"
      >
        <div className="source-card-fallback-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
        <div>
          <span className="source-card-domain">{domain}</span>
          <span className="source-card-fallback-text">
            Ver publicación original
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="source-slide source-card"
    >
      {preview.image && (
        <img src={preview.image} alt="" className="source-card-image" />
      )}
      <div className="source-card-body">
        <span className="source-card-domain">{preview.siteName || domain}</span>
        {preview.title && (
          <span className="source-card-title">{preview.title}</span>
        )}
      </div>
    </a>
  );
}

export default function SourcesDisplay({ sources }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const imageSources = sources
    .filter((s) => s.type === "imagen")
    .map((s) => s.url);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [sources]);

  function scrollByCard(direction) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".source-slide");
    const distance = card ? card.offsetWidth + 12 : 260;
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  if (!sources || sources.length === 0) return null;

  const showArrows = sources.length > 1;

  return (
    <section className="sources-display">
      <div className="sources-display-header">
        <h2>Fuentes</h2>
        {showArrows && (
          <div className="sources-display-arrows">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="sources-display-track" ref={trackRef}>
        {sources.map((s) => {
          if (s.type === "imagen") {
            const imgIndex = imageSources.indexOf(s.url);
            return (
              <button
                key={s.id}
                type="button"
                className="source-slide source-card source-card-image-only"
                onClick={() => setLightboxIndex(imgIndex)}
              >
                <img src={s.url} alt="Fuente" />
              </button>
            );
          }
          if (s.type === "video") {
            return (
              <div
                key={s.id}
                className="source-slide source-card source-card-video"
              >
                <iframe src={s.url} title="Fuente en video" allowFullScreen />
              </div>
            );
          }
          return <LinkPreviewCard key={s.id} url={s.url} />;
        })}
      </div>

      <Lightbox
        images={imageSources}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(dir) =>
          setLightboxIndex(
            (prev) => (prev + dir + imageSources.length) % imageSources.length,
          )
        }
      />
    </section>
  );
}
