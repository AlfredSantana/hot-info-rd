import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { formatDate } from "../lib/formatDate.js";
import CategoryBadge from "../components/CategoryBadge.jsx";
import PromoSlot from "../components/PromoSlot.jsx";
import "./AuthorProfile.css";
import { useSession } from "../lib/useSession.js";

const PROMO_AUTHOR = [
  {
    image: "/promo/banner-redes-1600x686px.mp4",
    link: "https://instagram.com/hotinford",
    alt: "Síguenos en Instagram y Facebook",
  },
];

export default function AuthorProfile() {
  const { slug } = useParams();
  const session = useSession();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthorProfile() {
      setLoading(true);

      // 1. Buscar los datos del autor
      const { data: authorData, error: authorError } = await supabase
        .from("autores")
        .select("*")
        .eq("slug", slug)
        .single();

      if (authorError || !authorData) {
        console.error("Error cargando autor:", authorError);
        setAuthor(null);
        setLoading(false);
        return;
      }
      setAuthor(authorData);

      // 2. Buscar noticias con la categoría unida (JOIN)
      const { data: articlesData, error: articlesError } = await supabase
        .from("noticias")
        .select(
          "id, titulo, slug, cover_image, published_at, categorias!noticias_categoria_id_fkey(nombre, slug, color)",
        )
        .eq("autor_id", authorData.id)
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (!articlesError && articlesData) {
        setArticles(articlesData);
      }

      setLoading(false);
    }

    loadAuthorProfile();
  }, [slug]);

  if (loading)
    return (
      <div className="author-container">
        <div className="author-loading">Cargando perfil…</div>
      </div>
    );
  if (!author)
    return (
      <div className="author-container">
        <div className="author-loading">Redactor no encontrado.</div>
      </div>
    );

  return (
    <div className="author-container">
      {/* Cabecera del perfil estilo tarjeta */}
      <div className="author-header-card">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.nombre}
            className="author-avatar"
          />
        ) : (
          <div className="author-avatar author-avatar-empty" />
        )}
        <div className="author-info">
          <h1>{author.nombre}</h1>
          <p className="author-bio">{author.bio}</p>
          <div className="author-stats">
            <span className="author-stat-badge">
              <strong>{articles.length}</strong>{" "}
              {articles.length === 1 ? "noticia" : "noticias"}
            </span>
          </div>
        </div>
      </div>

      {/* Espacio para anuncio promocional */}
      <div className="author-promo-wrapper">
        <PromoSlot items={PROMO_AUTHOR} aspectRatio="1600 / 686" />
      </div>

      {/* Lista de artículos */}
      <div className="author-articles">
        <h2 className="author-section-title">Últimas publicaciones</h2>

        {articles.length === 0 ? (
          <div className="author-no-articles">
            <p>Este redactor aún no ha publicado noticias.</p>
          </div>
        ) : (
          <div className="author-articles-grid">
            {articles.map((article) => (
              <Link
                to={`/noticia/${article.slug}`}
                key={article.id}
                className="author-article-card"
              >
                <div className="author-article-img-wrapper">
                  {article.cover_image ? (
                    <img
                      src={article.cover_image}
                      alt={article.titulo}
                      className="author-article-img"
                    />
                  ) : (
                    <div className="author-article-img-placeholder" />
                  )}

                  {/* Badge de Categoría flotante sobre la imagen */}
                  {article.categorias && (
                    <div className="author-article-badge">
                      <CategoryBadge
                        nombre={article.categorias.nombre}
                        color={article.categorias.color}
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                <div className="author-article-content">
                  <h3>{article.titulo}</h3>
                  {article.published_at && (
                    <span className="author-article-date">
                      {formatDate(article.published_at)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Lista de artículos */}
      <div className="author-articles">
        {/* ... código de la cuadrícula de noticias ... */}
      </div>

      {/* Botón flotante para administradores */}
      {session && (
        <Link
          to="/admin/nueva-noticia"
          className="home-new-article-btn"
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
      )}
    </div>
  );
}
