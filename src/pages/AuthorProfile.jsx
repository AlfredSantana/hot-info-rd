import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { formatDate } from "../lib/formatDate.js";
import CategoryBadge from "../components/CategoryBadge.jsx";
import PromoSlot from "../components/PromoSlot.jsx";
import ImageUpload from "../components/ImageUpload.jsx";
import Navbar from "../components/Navbar.jsx"; // <-- 1. Importa el Navbar
import "./AuthorProfile.css";
import { useSession } from "../lib/useSession.js";

const AD_AUTHOR = [
  {
    image: "/promo/banner-redes-1600x200px.mp4",
    link: "https://instagram.com/hotinford",
    alt: "Síguenos en nuestras redes",
  },
];

export default function AuthorProfile() {
  const { slug } = useParams();
  const session = useSession();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAuthorProfile() {
      setLoading(true);

      const { data: authorData, error: authorError } = await supabase
        .from("autores")
        .select("*")
        .eq("slug", slug)
        .single();

      if (authorError || !authorData) {
        setAuthor(null);
        setLoading(false);
        return;
      }
      setAuthor(authorData);

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

  function startEdit() {
    setEditForm({ bio: author.bio || "", avatar_url: author.avatar_url || "" });
    setIsEditing(true);
  }

  async function handleSaveProfile() {
    setSaving(true);
    const { error } = await supabase
      .from("autores")
      .update({ bio: editForm.bio, avatar_url: editForm.avatar_url })
      .eq("id", author.id);

    if (!error) {
      setAuthor({
        ...author,
        bio: editForm.bio,
        avatar_url: editForm.avatar_url,
      });
      setIsEditing(false);
    } else {
      alert("Error al actualizar el perfil.");
    }
    setSaving(false);
  }

  if (loading)
    return (
      <>
        <Navbar />
        <div className="author-container">
          <div className="author-loading">Cargando perfil…</div>
        </div>
      </>
    );

  if (!author)
    return (
      <>
        <Navbar />
        <div className="author-container">
          <div className="author-loading">Redactor no encontrado.</div>
        </div>
      </>
    );

  return (
    <>
      <Navbar /> {/* <-- 2. Renderiza el Navbar */}
      <div className="author-container">
        {/* Cabecera del perfil estilo tarjeta con modo Edición */}
        <div className="author-header-card">
          {session && !isEditing && (
            <button
              onClick={startEdit}
              className="author-edit-btn"
              aria-label="Editar perfil"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
              </svg>
              <span className="author-edit-text">Editar perfil</span>
            </button>
          )}

          {isEditing ? (
            <div className="author-edit-avatar-wrapper">
              <ImageUpload
                value={editForm.avatar_url}
                onChange={(url) =>
                  setEditForm({ ...editForm, avatar_url: url })
                }
              />
            </div>
          ) : author.avatar_url ? (
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

            {isEditing ? (
              <textarea
                className="author-edit-bio-input"
                rows="3"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                placeholder="Escribe tu biografía aquí..."
              />
            ) : (
              <p className="author-bio">{author.bio}</p>
            )}

            {isEditing ? (
              <div className="author-edit-actions">
                <button
                  onClick={() => setIsEditing(false)}
                  className="author-btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="author-btn-save"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            ) : (
              <div className="author-stats">
                <span className="author-stat-badge">
                  <strong>{articles.length}</strong>{" "}
                  {articles.length === 1 ? "noticia" : "noticias"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="author-promo-wrapper">
          <PromoSlot items={AD_AUTHOR} aspectRatio="1600 / 200" />
        </div>

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
            <span className="home-fab-text">Nueva noticia</span>
          </Link>
        )}
      </div>
    </>
  );
}
