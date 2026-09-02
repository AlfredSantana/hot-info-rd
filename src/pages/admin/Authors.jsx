import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import ImageUpload from "../../components/ImageUpload.jsx";
import "./Admin.css";

const emptyForm = { id: null, nombre: "", bio: "", avatar_url: "" };

export default function Authors() {
  const [autores, setAutores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  async function loadAutores() {
    const { data } = await supabase
      .from("autores")
      .select("id, nombre, bio, avatar_url")
      .order("nombre");
    if (data) setAutores(data);
    setLoading(false);
  }

  useEffect(() => {
    loadAutores();
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(autor) {
    setForm(autor);
  }

  function startNew() {
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");

    const payload = {
      nombre: form.nombre,
      bio: form.bio,
      avatar_url: form.avatar_url,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase
        .from("autores")
        .update(payload)
        .eq("id", form.id));
    } else {
      ({ error } = await supabase.from("autores").insert(payload));
    }

    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }

    setStatus(null);
    setForm(emptyForm);
    loadAutores();
  }

  async function handleDelete(id) {
    if (
      !confirm(
        "¿Eliminar este redactor? Las noticias ya escritas por él no se borran.",
      )
    )
      return;
    await supabase.from("autores").delete().eq("id", id);
    loadAutores();
  }

  return (
    <div className="admin-form-wrapper">
      <div className="admin-form-header">
        <h1>{form.id ? "Editar redactor" : "Nuevo redactor"}</h1>
        <p className="only-desktop">Crea o edita perfiles de redactores.</p>
      </div>

      {status === "error" && (
        <p className="admin-error">Ocurrió un error al guardar.</p>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-section">
          <label>
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              required
            />
          </label>

          <label>
            Foto de perfil
            <ImageUpload
              value={form.avatar_url}
              onChange={(url) => handleChange("avatar_url", url)}
              isCircle={true}
            />
          </label>

          <label>
            Bio corta
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Ej: Redactora de farándula y entretenimiento en Hot Info RD."
            />
          </label>
        </section>

        <div className="admin-form-actions">
          {form.id && (
            <button
              type="button"
              onClick={startNew}
              className="admin-btn-secondary"
            >
              Cancelar edición
            </button>
          )}
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={status === "saving"}
          >
            {status === "saving"
              ? "Guardando…"
              : form.id
                ? "Guardar cambios"
                : "Crear redactor"}
          </button>
        </div>
      </form>

      <hr
        style={{
          margin: "2rem 0",
          border: "none",
          borderTop: "1px solid var(--color-border)",
        }}
      />

      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
        Redactores existentes
      </h2>

      {loading && <p>Cargando…</p>}

      <div className="admin-authors-list">
        {autores.map((a) => (
          <div key={a.id} className="admin-author-card">
            {a.avatar_url ? (
              <img
                src={a.avatar_url}
                alt={a.nombre}
                className="admin-author-avatar"
              />
            ) : (
              <div className="admin-author-avatar admin-author-avatar-empty" />
            )}
            <div className="admin-author-info">
              <p className="admin-author-name">{a.nombre}</p>
              <p className="admin-author-bio">{a.bio}</p>
            </div>
            <div className="admin-actions admin-author-actions">
              <a onClick={() => startEdit(a)} className="admin-clickable">
                Editar
              </a>
              <button
                onClick={() => handleDelete(a.id)}
                className="admin-delete"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
