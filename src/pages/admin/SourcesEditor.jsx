import { useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import "./SourcesEditor.css";
import { compressImage } from "../../lib/compressImage.js";

const TYPES = [
  { value: "enlace", label: "Enlace" },
  { value: "imagen", label: "Imagen" },
  { value: "video", label: "Video" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function SourcesEditor({ value = [], onChange }) {
  const [type, setType] = useState("enlace");
  const [draftUrl, setDraftUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  function addSource(url, sourceType = type) {
    if (!url.trim()) return;
    onChange([...value, { id: uid(), type: sourceType, url: url.trim() }]);
    setDraftUrl("");
  }

  function removeSource(id) {
    onChange(value.filter((s) => s.id !== id));
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);

    const newSources = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file, { watermark: false });
        const fileExt = compressed.name.split(".").pop();
        const fileName = `fuentes/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("noticias")
          .upload(fileName, compressed, {
            contentType: compressed.type,
            upsert: false,
          });

        if (!error) {
          const { data } = supabase.storage
            .from("noticias")
            .getPublicUrl(fileName);
          newSources.push({ id: uid(), type: "imagen", url: data.publicUrl });
        } else {
          console.error("Error al subir fuente:", error);
        }
      } catch (err) {
        console.error("Error al comprimir imagen de fuente:", err);
      }
    }

    if (newSources.length > 0) {
      onChange([...value, ...newSources]);
    }

    setUploading(false);
    e.target.value = "";
  }
  return (
    <div className="sources-editor">
      <div className="sources-editor-type-row">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`sources-editor-type-btn ${type === t.value ? "is-active" : ""}`}
            onClick={() => setType(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === "imagen" ? (
        <label className="sources-editor-file-btn">
          {uploading ? "Subiendo…" : "Elegir imagen"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            hidden
          />
        </label>
      ) : (
        <div className="sources-editor-url-row">
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder={
              type === "video"
                ? "https://www.youtube.com/embed/XXXXXXXX"
                : "https://... (post, tuit, artículo)"
            }
          />
          <button
            type="button"
            onClick={() => addSource(draftUrl)}
            className="sources-editor-add-btn"
          >
            Agregar
          </button>
        </div>
      )}

      {value.length > 0 && (
        <div className="sources-editor-list">
          {value.map((s) => (
            <div key={s.id} className="sources-editor-chip">
              <span
                className={`sources-editor-tag sources-editor-tag-${s.type}`}
              >
                {s.type === "enlace"
                  ? "Enlace"
                  : s.type === "imagen"
                    ? "Imagen"
                    : "Video"}
              </span>
              <span className="sources-editor-chip-url" title={s.url}>
                {s.url}
              </span>
              <button
                type="button"
                onClick={() => removeSource(s.id)}
                aria-label="Quitar fuente"
                className="sources-editor-remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
