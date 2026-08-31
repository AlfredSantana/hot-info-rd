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
import "./ArticlePage.css";

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const session = useSession();

  function copyRedactorLink() {
    const message = `Amplía esta noticia en: ${url}`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    let active = true;
    async function fetchArticle() {
      const { data, error } = await supabase
        .from("noticias")
        .select(
          "*, categorias!noticias_categoria_id_fkey(nombre, slug, color), autores(nombre, avatar_url), noticia_tags(categoria_id, categorias(nombre, slug, color))",
        )
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (active) {
        if (!error) setArticle(data);
        setLoading(false);
      }
    }
    fetchArticle();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    const key = `viewed-${article.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    supabase
      .rpc("increment_views", { noticia_id: article.id })
      .then(({ error }) => {
        if (error) console.error("Error al incrementar vistas:", error);
      });
  }, [article]);

  if (loading) return <div className="article-loading">Cargando…</div>;
  if (!article)
    return <div className="article-loading">Artículo no encontrado</div>;

  const url = `${window.location.origin}/noticia/${article.slug}`;
  const formattedDate = formatDate(article.published_at);

  return (
    <>
      <SEO
        title={article.titulo}
        description={article.excerpt}
        image={article.cover_image}
        url={url}
        type="article"
        publishedTime={article.published_at}
        section={article.categorias?.nombre}
      />

      <article className="article">
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
        <h1>{article.titulo}</h1>

        <div className="article-meta">
          {article.autores?.nombre && <span>Por {article.autores.nombre}</span>}
          {article.autores?.nombre && formattedDate && (
            <span className="article-meta-dot">·</span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
        </div>

        <img
          src={article.cover_image}
          alt={article.titulo}
          className="article-cover"
        />

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
              aria-label="Copiar link para Facebook"
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
              {copied ? "✓ Copiado" : "Copiar link"}
            </button>
          </div>
        )}

        <ShareButtons url={url} title={article.titulo} />

        <div
          className="article-content"
          dangerouslySetInnerHTML={{
            __html: formatArticleContent(article.contenido),
          }}
        />
      </article>

      <SourcesDisplay sources={article.fuentes} />

      <RelatedArticles
        categoriaId={article.categoria_id}
        tagIds={(article.noticia_tags || [])
          .map((t) => t.categoria_id)
          .filter(Boolean)}
        currentId={article.id}
      />
    </>
  );
}
