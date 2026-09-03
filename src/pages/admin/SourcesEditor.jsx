import { useState } from "react";
import "./SourcesEditor.css";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function SourcesEditor({ value = [], onChange }) {
  const [draftText, setDraftText] = useState("");

  function addSource() {
    if (!draftText.trim()) return;

    // Guardamos el código de inserción o link en la propiedad 'url' para mantener compatibilidad con tu base de datos
    onChange([...value, { id: uid(), type: "embed", url: draftText.trim() }]);
    setDraftText("");
  }

  function removeSource(id) {
    onChange(value.filter((s) => s.id !== id));
  }

  return (
    <div className="sources-editor">
      <div className="sources-editor-url-row">
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Pega el link o el código de inserción (embed) de la fuente externa..."
          rows="3"
        />
        <button
          type="button"
          onClick={addSource}
          className="sources-editor-add-btn"
        >
          Agregar
        </button>
      </div>

      {value.length > 0 && (
        <div className="sources-editor-list">
          {value.map((s) => (
            <div
              key={s.id}
              className="sources-editor-chip sources-editor-chip-embed"
            >
              <div className="sources-editor-chip-header">
                <span className="sources-editor-tag">Fuente Externa</span>
                <button
                  type="button"
                  onClick={() => removeSource(s.id)}
                  aria-label="Quitar fuente"
                  className="sources-editor-remove"
                >
                  × Eliminar
                </button>
              </div>
              <div className="sources-editor-chip-url">{s.url}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
