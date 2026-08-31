import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import { formatDate } from "../../lib/formatDate.js";
import "./Admin.css";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    const { data } = await supabase
      .from("noticias")
      .select(
        "id, slug, titulo, published, published_at, categorias!noticias_categoria_id_fkey(nombre), autores(nombre)",
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

  return (
    <div className="admin-list">
      <div className="admin-list-header">
        <h1>Noticias</h1>
        <Link to="/admin/nueva-noticia" className="admin-btn-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva noticia
        </Link>
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
          {/* Vista tarjetas — mobile */}
          <div className="admin-article-cards">
            {articles.map((a) => (
              <div key={a.id} className="admin-article-card">
                <h3
                  className="admin-article-card-title admin-clickable"
                  onClick={() => goToArticle(a.slug)}
                >
                  {a.titulo}
                </h3>
                <div className="admin-article-card-meta">
                  <span>{a.categorias?.nombre ?? "—"}</span>
                  <span>·</span>
                  <span>{a.autores?.nombre ?? "—"}</span>
                  <span>·</span>
                  <span>
                    {formatDate(a.published_at, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="admin-article-card-footer">
                  <button
                    className={`admin-badge ${a.published ? "is-published" : "is-draft"}`}
                    onClick={() => togglePublished(a.id, a.published)}
                  >
                    {a.published ? "Publicada" : "Borrador"}
                  </button>
                  <div className="admin-actions">
                    <Link to={`/admin/editar/${a.id}`}>Editar</Link>
                    <button
                      onClick={() => requestDelete(a.id)}
                      className="admin-delete"
                    >
                      Eliminar
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
                <col style={{ width: "30%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "15%" }} />
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
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td
                      className="admin-table-title admin-clickable"
                      onClick={() => goToArticle(a.slug)}
                    >
                      {a.titulo}
                    </td>
                    <td>{a.categorias?.nombre ?? "—"}</td>
                    <td>{a.autores?.nombre ?? "—"}</td>
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
                    <td className="admin-actions">
                      <Link to={`/admin/editar/${a.id}`}>Editar</Link>
                      <button
                        onClick={() => requestDelete(a.id)}
                        className="admin-delete"
                      >
                        Eliminar
                      </button>
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
    </div>
  );
}
