import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import ImageUpload from "../../components/ImageUpload.jsx";
import SourcesEditor from "./SourcesEditor.jsx";
import "./Admin.css";
import "./SourcesEditor.css";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import TagsSelector from "./TagsSelector.jsx";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const emptyForm = {
  titulo: "",
  tags: [],
  slug: "",
  cover_image: "",
  excerpt: "",
  contenido: "",
  categoria_id: "",
  autor_id: "",
  fuentes: [],
  published_at: new Date().toISOString().slice(0, 10),
  published: true,
};

export default function ArticleForm({ articleId }) {
  const isEditing = Boolean(articleId);
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [autores, setAutores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [status, setStatus] = useState(null);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    supabase
      .from("categorias")
      .select("id, nombre")
      .then(({ data }) => data && setCategorias(data));
    supabase
      .from("autores")
      .select("id, nombre")
      .then(({ data }) => {
        if (data) {
          setAutores(data);
          if (data.length === 1 && !isEditing) {
            setForm((prev) => ({ ...prev, autor_id: data[0].id }));
          }
        }
      });
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    async function load() {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("id", articleId)
        .single();

      const { data: tagsData } = await supabase
        .from("noticia_tags")
        .select("categoria_id")
        .eq("noticia_id", articleId);

      if (!error && data) {
        setForm({
          titulo: data.titulo,
          slug: data.slug,
          cover_image: data.cover_image || "",
          excerpt: data.excerpt || "",
          contenido: data.contenido || "",
          categoria_id: data.categoria_id || "",
          autor_id: data.autor_id || "",
          fuentes: data.fuentes || [],
          tags: tagsData ? tagsData.map((t) => t.categoria_id) : [],
          published_at:
            data.published_at?.slice(0, 10) ||
            new Date().toISOString().slice(0, 10),
          published: data.published,
        });
      }
      setLoadingData(false);
    }
    load();
  }, [articleId, isEditing]);

  function handleChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "titulo" && !slugEdited) next.slug = slugify(value);
      return next;
    });
  }

  function applyFormat(tag) {
    const textarea = document.getElementById("admin-editor");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.contenido;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);

    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;

    handleChange("contenido", before + openTag + selected + closeTag + after);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(
          start,
          start + openTag.length + selected.length + closeTag.length,
        );
      } else {
        textarea.setSelectionRange(
          start + openTag.length,
          start + openTag.length,
        );
      }
    }, 0);
  }

  function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit(e);
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        applyFormat("b");
      } else if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        applyFormat("i");
      } else if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        applyFormat("u");
      }
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setStatus("saving");

    const payload = {
      titulo: form.titulo,
      slug: form.slug || slugify(form.titulo),
      cover_image: form.cover_image,
      excerpt: form.excerpt,
      contenido: form.contenido,
      categoria_id: form.categoria_id,
      autor_id: form.autor_id || null,
      fuentes: form.fuentes,
      published_at: form.published_at || new Date().toISOString().slice(0, 10),
      published: form.published,
    };

    let currentArticleId = articleId;

    if (isEditing) {
      const { error } = await supabase
        .from("noticias")
        .update(payload)
        .eq("id", articleId);
      if (error) {
        console.error("Error actualizando noticia:", error);
        setStatus("error");
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("noticias")
        .insert(payload)
        .select()
        .single();
      if (error) {
        console.error("Error creando noticia:", error);
        setStatus("error");
        return;
      }
      currentArticleId = data.id;
    }

    // Actualización de Tags
    const { error: deleteTagsError } = await supabase
      .from("noticia_tags")
      .delete()
      .eq("noticia_id", currentArticleId);

    if (deleteTagsError) {
      console.error("Error eliminando tags (RLS bloqueado):", deleteTagsError);
    }

    if (form.tags.length > 0) {
      const tagsPayload = form.tags.map((tagId) => ({
        noticia_id: currentArticleId,
        categoria_id: tagId,
      }));
      await supabase.from("noticia_tags").insert(tagsPayload);
    }

    setStatus("success");
    navigate("/admin");
  }

  function requestDelete() {
    setDeleteTarget(articleId);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setStatus("saving");
    const { error } = await supabase
      .from("noticias")
      .delete()
      .eq("id", deleteTarget);
    if (!error) {
      navigate("/admin");
    } else {
      setStatus("error");
      setDeleteTarget(null);
    }
  }

  if (loadingData) return <p>Cargando noticia…</p>;

  return (
    <div className="admin-form-wrapper" onKeyDown={handleKeyDown}>
      <div className="admin-form-header">
        <h1>{isEditing ? "Editar noticia" : "Redactar noticia"}</h1>
        <p className="only-desktop">
          Completa los campos y publica. <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para
          guardar rápido.
        </p>
        <p className="only-mobile">Completa lo esencial y publica.</p>
      </div>

      {status === "error" && (
        <p className="admin-error">
          Ocurrió un error al guardar. Revisa la consola o los permisos.
        </p>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-section">
          <label>
            Título* (EN MAYÚSCULAS)
            <input
              type="text"
              value={form.titulo}
              onChange={(e) =>
                handleChange("titulo", e.target.value.toUpperCase())
              }
              autoFocus
              required
            />
          </label>

          <label>
            Resumen
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => handleChange("excerpt", e.target.value)}
              required
            />
          </label>

          <div className="admin-editor-container">
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                marginBottom: "0.4rem",
                fontWeight: "600",
                display: "block",
              }}
            >
              Contenido (Usa Ctrl+B, Ctrl+I, Ctrl+U)
            </span>

            <div className="admin-editor-toolbar">
              <div className="admin-editor-toolbar-group">
                <button
                  type="button"
                  onClick={() => applyFormat("b")}
                  title="Negrita"
                  style={{ fontWeight: "bold" }}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("i")}
                  title="Cursiva"
                  style={{ fontStyle: "italic", fontFamily: "serif" }}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("u")}
                  title="Subrayado"
                  style={{ textDecoration: "underline" }}
                >
                  U
                </button>
              </div>
            </div>

            <textarea
              id="admin-editor"
              className="admin-textarea-content"
              value={form.contenido}
              onChange={(e) => handleChange("contenido", e.target.value)}
              placeholder="Escribe tu noticia o pega el código de Instagram aquí..."
              required
            />
          </div>

          <label>
            Imagen principal (Se recomienda 16:9)
            <ImageUpload
              value={form.cover_image}
              onChange={(url) => handleChange("cover_image", url)}
            />
          </label>

          <label>
            Categoría
            <select
              value={form.categoria_id}
              onChange={(e) => handleChange("categoria_id", e.target.value)}
              required
            >
              <option value="">Selecciona…</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </label>
        </section>

        <details className="admin-advanced">
          <summary>Opciones avanzadas</summary>

          <div className="admin-section admin-advanced-content">
            <label>
              Slug (URL)
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  handleChange("slug", e.target.value);
                }}
                /* SE ELIMINÓ EL 'REQUIRED' AQUÍ */
              />
            </label>

            <label>
              Autor
              <select
                name="autor"
                value={form.autor_id}
                onChange={(e) => handleChange("autor_id", e.target.value)}
              >
                <option value="">Sin asignar</option>
                {autores.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tags adicionales (opcional)
              <TagsSelector
                categoriaPrincipalId={form.categoria_id}
                value={form.tags}
                onChange={(tags) => handleChange("tags", tags)}
              />
            </label>

            <label>
              Fuentes (enlaces, imágenes o videos)
              <SourcesEditor
                value={form.fuentes}
                onChange={(fuentes) => handleChange("fuentes", fuentes)}
              />
            </label>

            {/* CAJA ALINEADA CON CSS */}
            <div className="admin-date-publish-row">
              <label>
                Fecha
                <input
                  type="date"
                  name="fecha"
                  value={form.published_at}
                  onChange={(e) => handleChange("published_at", e.target.value)}
                />
              </label>

              <label className="admin-checkbox-aligned">
                <input
                  type="checkbox"
                  name="published"
                  checked={form.published}
                  onChange={(e) => handleChange("published", e.target.checked)}
                />
                Publicar ahora
              </label>
            </div>
          </div>
        </details>

        <div className="admin-form-actions">
          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="admin-btn-secondary"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={requestDelete}
                className="admin-btn-danger"
              >
                Eliminar noticia
              </button>
            </>
          )}
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={status === "saving"}
          >
            {status === "saving"
              ? "Guardando…"
              : isEditing
                ? "Guardar cambios"
                : "Publicar noticia"}
          </button>
        </div>
      </form>

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
