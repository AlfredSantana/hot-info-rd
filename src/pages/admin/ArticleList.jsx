import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import { formatDate } from "../../lib/formatDate.js";
import CategoryBadge from "../../components/CategoryBadge.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { useSession } from "../../lib/useSession.js";
import "./Admin.css";

export default function ArticleList() {
  const session = useSession();
  const [articles, setArticles] = useState([]);
  const [categoriasUnicas, setCategoriasUnicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [filtroCategoria, setFiltroCategoria] = useState("all");

  useEffect(() => {
    fetchArticles();
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    const { data } = await supabase
      .from("categorias")
      .select("nombre")
      .order("nombre");
    if (data) {
      setCategoriasUnicas(data.map((c) => c.nombre));
    }
  }

  async function fetchArticles() {
    setLoading(true);
    const { data } = await supabase
      .from("noticias")
      .select(
        "id, slug, titulo, published, published_at, categorias!noticias_categoria_id_fkey(nombre, color), autores(nombre, avatar_url), noticia_tags(categorias(nombre))",
      )
      .order("published_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  async function togglePublished(id, current) {
    await supabase
      .from("noticias")
      .update({ published: !current })
      .eq("id", id);
    fetchArticles();
  }

  function requestDelete(id) {
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    const { error } = await supabase
      .from("noticias")
      .delete()
      .eq("id", deleteTarget);
    setDeleteTarget(null);
    if (error) {
      console.error(error);
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    fetchArticles();
  }

  function goToArticle(slug) {
    window.open(`/noticia/${slug}`, "_blank");
  }

  const articulosFiltrados =
    filtroCategoria === "all"
      ? articles
      : articles.filter((a) => {
          const esPrincipal = a.categorias?.nombre === filtroCategoria;
          const esSecundaria = a.noticia_tags?.some(
            (tag) => tag.categorias?.nombre === filtroCategoria,
          );
          return esPrincipal || esSecundaria;
        });

  const totalGeneral = articles.length;
  const totalFiltrado = articulosFiltrados.length;

  return (
    <div className="admin-list">
      <div className="admin-list-header">
        <h1>Noticias</h1>
      </div>

      {loading && <p>Cargando…</p>}

      {!loading && articles.length === 0 && (
        <div className="admin-empty">
          <p>No hay noticias todavía.</p>
          <Link to="/admin/nueva-noticia" className="admin-btn-primary">
            Redactar la primera
          </Link>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <>
          <div
            className="admin-filters-bar"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              background: "var(--color-surface)",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="admin-stats"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "var(--color-text-muted)",
              }}
            >
              <span>
                Total histórico:{" "}
                <strong style={{ color: "var(--color-text)" }}>
                  {totalGeneral}
                </strong>
              </span>
              {filtroCategoria !== "all" && (
                <span>
                  En {filtroCategoria}:{" "}
                  <strong style={{ color: "var(--color-accent)" }}>
                    {totalFiltrado}
                  </strong>
                </span>
              )}
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              style={{
                maxWidth: "100%",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <option value="all">Todas las categorías</option>
              {categoriasUnicas.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Vista tarjetas — mobile */}
          <div className="admin-article-cards">
            {articulosFiltrados.map((a) => (
              <div key={a.id} className="admin-article-card">
                <h3
                  className="admin-article-card-title admin-clickable"
                  onClick={() => goToArticle(a.slug)}
                >
                  {a.titulo}
                </h3>

                <div className="admin-article-card-meta">
                  {/* Lado izquierdo: Categoría */}
                  <div className="admin-meta-left">
                    {a.categorias ? (
                      <CategoryBadge
                        nombre={a.categorias.nombre}
                        color={a.categorias.color}
                        size="sm"
                      />
                    ) : (
                      "—"
                    )}
                  </div>

                  {/* Lado derecho: Autor y Fecha estáticos */}
                  <div className="admin-meta-right">
                    <div
                      className="admin-table-author-wrapper"
                      title={a.autores?.nombre}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        maxWidth: "130px",
                      }}
                    >
                      {a.autores?.avatar_url ? (
                        <img
                          src={a.autores.avatar_url}
                          alt={a.autores.nombre}
                          className="admin-table-avatar"
                          style={{ width: "20px", height: "20px" }}
                        />
                      ) : (
                        <div
                          className="admin-table-avatar admin-table-avatar-empty"
                          style={{ width: "20px", height: "20px" }}
                        />
                      )}
                      <span
                        style={{
                          marginLeft: "0.4rem",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {a.autores?.nombre}
                      </span>
                    </div>
                    <span>·</span>
                    <span>
                      {formatDate(a.published_at, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="admin-article-card-footer">
                  <button
                    className={`admin-badge ${a.published ? "is-published" : "is-draft"}`}
                    onClick={() => togglePublished(a.id, a.published)}
                  >
                    {a.published ? "Publicada" : "Borrador"}
                  </button>
                  <div className="admin-actions">
                    <Link
                      to={`/admin/editar/${a.id}`}
                      aria-label="Editar"
                      style={{
                        color: "var(--color-text-muted)",
                        padding: "0.4rem",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => requestDelete(a.id)}
                      className="admin-delete"
                      aria-label="Eliminar"
                      style={{
                        background: "none",
                        border: "none",
                        padding: "0.4rem",
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista tabla — desktop */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <colgroup>
                <col style={{ width: "38%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="col-title">Título</th>
                  <th className="col-category">Categoría</th>
                  <th className="col-author">Autor</th>
                  <th className="col-date">Fecha</th>
                  <th className="col-status">Estado</th>
                  <th className="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articulosFiltrados.map((a) => (
                  <tr key={a.id}>
                    <td
                      className="admin-table-title admin-clickable"
                      onClick={() => goToArticle(a.slug)}
                      title={a.titulo}
                    >
                      {a.titulo}
                    </td>
                    <td>
                      {a.categorias ? (
                        <CategoryBadge
                          nombre={a.categorias.nombre}
                          color={a.categorias.color}
                          size="sm"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div
                        className="admin-table-author-wrapper"
                        title={a.autores?.nombre}
                      >
                        {a.autores?.avatar_url ? (
                          <img
                            src={a.autores.avatar_url}
                            alt={a.autores.nombre}
                            className="admin-table-avatar"
                          />
                        ) : (
                          <div className="admin-table-avatar admin-table-avatar-empty" />
                        )}
                        <span
                          style={{
                            marginLeft: "0.6rem",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {a.autores?.nombre}
                        </span>
                      </div>
                    </td>
                    <td>
                      {formatDate(a.published_at, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        className={`admin-badge ${a.published ? "is-published" : "is-draft"}`}
                        onClick={() => togglePublished(a.id, a.published)}
                      >
                        {a.published ? "Publicada" : "Borrador"}
                      </button>
                    </td>
                    <td className="admin-actions-cell">
                      <div className="admin-actions">
                        <Link
                          to={`/admin/editar/${a.id}`}
                          aria-label="Editar"
                          style={{ color: "var(--color-text-muted)" }}
                          title="Editar"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => requestDelete(a.id)}
                          className="admin-delete"
                          aria-label="Eliminar"
                          title="Eliminar"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#dc2626",
                            cursor: "pointer",
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar noticia"
        message="Esta acción no se puede deshacer. ¿Seguro que quieres eliminarla?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

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
  );
}
