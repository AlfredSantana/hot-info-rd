import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { supabase } from "../lib/supabaseClient.js";
import { formatArticleContent } from "../lib/formatContent.js";
import { formatDate } from "../lib/formatDate.js";
import { useSession } from "../lib/useSession.js";
import SEO from "../components/SEO.jsx";
import ShareButtons from "../components/ShareButtons.jsx";
import RelatedArticles from "../components/RelatedArticles.jsx";
import SourcesDisplay from "../components/SourcesDisplay.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import PromoSlot from "../components/PromoSlot.jsx";
import "./ArticlePage.css";

const AD_MOBILE_TOP = [
  {
    image: "/promo/banner-redes-960x300px.mp4",
    link: "https://instagram.com/hotinford",
  },
];
const AD_DESKTOP_TOP = [
  {
    image: "/promo/banner-redes-960x300px.mp4",
    link: "https://instagram.com/hotinford",
  },
];
const AD_SIDEBAR = [
  {
    image: "/promo/banner-redes-1000x1250px.mp4",
    link: "https://instagram.com/hotinford",
  },
];
const AD_FOOTER = [
  {
    image: "/promo/banner-redes-1600x686px.mp4",
    link: "https://instagram.com/hotinford",
  },
];

export default function ArticlePage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const session = useSession();

  // ─────────────────────────────────────────────
  // URL del artículo
  // ─────────────────────────────────────────────

  const url = article
    ? `${window.location.origin}/noticia/${article.slug}`
    : "";

  // ─────────────────────────────────────────────
  // Copiar enlace para compartir
  // ─────────────────────────────────────────────

  function copyRedactorLink() {
    const message = `Amplía esta noticia en: ${url}`;

    navigator.clipboard.writeText(message);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  // ─────────────────────────────────────────────
  // Obtener artículo
  // ─────────────────────────────────────────────

  useEffect(() => {
    let active = true;

    async function fetchArticle() {
      const { data, error } = await supabase
        .from("noticias")
        .select(
          "*, categorias!noticias_categoria_id_fkey(nombre, slug, color), autores(nombre, avatar_url, bio, slug), noticia_tags(categoria_id, categorias(nombre, slug, color))",
        )
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (!active) return;

      if (!error) {
        setArticle(data);
      }

      setLoading(false);
    }

    fetchArticle();

    return () => {
      active = false;
    };
  }, [slug]);

  // ─────────────────────────────────────────────
  // Registrar visita
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // Procesar Embeds (Instagram, etc.)
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!article) return;

    // Cargar script de Instagram si hay un embed
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const script = document.createElement("script");
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [article]);

  // ─────────────────────────────────────────────
  // Estados de carga
  // ─────────────────────────────────────────────

  if (loading) {
    return <div className="article-loading">Cargando…</div>;
  }

  if (!article) {
    return <div className="article-loading">Artículo no encontrado</div>;
  }

  const formattedDate = formatDate(article.published_at);

  return (
    <>
      {/* SEO */}
      <SEO
        title={article.titulo}
        description={article.excerpt}
        image={article.cover_image}
        url={url}
        type="article"
        publishedTime={article.published_at}
        section={article.categorias?.nombre}
      />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="article-layout">
        {/* ─────────────────────────────────────
            CONTENIDO PRINCIPAL
        ───────────────────────────────────── */}

        <main className="article-main">
          <article className="article">
            {/* 1. Categorías */}
            <div className="article-tags-row">
              <CategoryBadge
                nombre={article.categorias?.nombre}
                color={article.categorias?.color}
                size="md"
              />
              {(article.noticia_tags || []).map((t) => (
                <CategoryBadge
                  key={t.categorias.slug}
                  nombre={t.categorias.nombre}
                  color={t.categorias.color}
                  size="md"
                />
              ))}
            </div>

            {/* 2. Título */}
            <h1>{article.titulo}</h1>

            {/* 3. Autor y fecha */}
            <div className="article-author-block">
              {article.autores?.avatar_url &&
                (article.autores?.slug ? (
                  <Link
                    to={`/autor/${article.autores.slug}`}
                    style={{ display: "block", flexShrink: 0 }}
                  >
                    <img
                      src={article.autores.avatar_url}
                      alt={article.autores.nombre}
                      className="article-author-avatar"
                    />
                  </Link>
                ) : (
                  <img
                    src={article.autores.avatar_url}
                    alt={article.autores.nombre}
                    className="article-author-avatar"
                  />
                ))}

              <div className="article-author-info">
                <div className="article-meta">
                  {article.autores?.nombre && (
                    <span>
                      {article.autores?.slug ? (
                        <Link
                          to={`/autor/${article.autores.slug}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <span
                            style={{ fontWeight: "bold" }}
                            className="admin-clickable"
                          >
                            {article.autores.nombre}
                          </span>
                        </Link>
                      ) : (
                        <span style={{ fontWeight: "bold" }}>
                          {article.autores.nombre}
                        </span>
                      )}
                    </span>
                  )}
                  {formattedDate && (
                    <span className="article-date-wrapper">
                      {article.autores?.nombre && (
                        <span className="article-meta-dot">·</span>
                      )}
                      <span className="article-date">{formattedDate}</span>
                    </span>
                  )}
                </div>
                {article.autores?.bio && (
                  <p className="article-author-bio">{article.autores.bio}</p>
                )}
              </div>
            </div>

            {/* 4. Imagen principal */}
            {article.cover_image && (
              <img
                src={article.cover_image}
                alt={article.titulo}
                className="article-cover"
              />
            )}

            {/* 5. Herramientas de administrador */}
            {session && (
              <div className="article-admin-toolbar">
                <Link
                  to={`/admin/editar/${article.id}`}
                  className="article-toolbar-btn article-toolbar-btn-accent"
                  aria-label="Editar esta noticia"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={copyRedactorLink}
                  className="article-toolbar-btn"
                  aria-label="Copiar link"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? "Copiado" : "Copiar link"}
                </button>
                <Link
                  to="/admin/nueva-noticia"
                  className="article-toolbar-btn article-toolbar-btn-accent article-toolbar-btn-accent-new"
                  aria-label="Crear nueva noticia"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Nueva noticia
                </Link>
              </div>
            )}

            {/* 6. Contenido principal con anuncios intercalados */}
            {(() => {
              const htmlContent = formatArticleContent(article.contenido);
              const paragraphs = htmlContent.split("</p>");

              if (paragraphs.length <= 3) {
                return (
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                );
              }

              const cutIndex = 2;
              const part1 =
                paragraphs.slice(0, cutIndex + 1).join("</p>") + "</p>";
              const part2 = paragraphs.slice(cutIndex + 1).join("</p>");

              return (
                <>
                  <div
                    className="article-content"
                    style={{ marginTop: "1.5rem" }}
                    dangerouslySetInnerHTML={{ __html: part1 }}
                  />

                  {/* Anuncios incrustados condicionalmente */}
                  <div className="mobile-only-ad">
                    <PromoSlot items={AD_MOBILE_TOP} aspectRatio="320 / 100" />
                  </div>
                  <div className="desktop-only-ad" style={{ margin: "2rem 0" }}>
                    <PromoSlot items={AD_DESKTOP_TOP} aspectRatio="960 / 300" />
                  </div>

                  <div
                    className="article-content"
                    style={{ marginTop: "0" }}
                    dangerouslySetInnerHTML={{ __html: part2 }}
                  />
                </>
              );
            })()}

            {/* 7. Botones de Compartir */}
            <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
              <ShareButtons url={url} title={article.titulo} />
            </div>

            {/* 8. Publicidad final de pie de artículo */}
            <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
              <PromoSlot items={AD_FOOTER} aspectRatio="1600 / 686" />
            </div>
          </article>

          {/* 9. Fuentes Originales */}
          <SourcesDisplay sources={article.fuentes} />
        </main>

        {/* ─────────────────────────────────────
            SIDEBAR
        ───────────────────────────────────── */}

        <aside className="article-sidebar">
          {/* Banner vertical de Sidebar */}
          <PromoSlot items={AD_SIDEBAR} aspectRatio="1000 / 1250" />

          {/* Noticias relacionadas */}
          <RelatedArticles
            categoriaId={article.categoria_id}
            tagIds={(article.noticia_tags || [])
              .map((t) => t.categoria_id)
              .filter(Boolean)}
            currentId={article.id}
            compact
          />
        </aside>
      </div>
    </>
  );
}
