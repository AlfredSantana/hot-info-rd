import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import "./TagsSelector.css";

export default function TagsSelector({
  categoriaPrincipalId,
  value = [],
  onChange,
}) {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    supabase
      .from("categorias")
      .select("id, nombre, color")
      .then(({ data }) => {
        if (data) setCategorias(data);
      });
  }, []);

  function toggle(id) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  const options = categorias.filter((c) => c.id !== categoriaPrincipalId);

  return (
    <div className="tags-selector">
      {options.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`tags-selector-chip ${value.includes(cat.id) ? "is-active" : ""}`}
          style={
            value.includes(cat.id)
              ? { background: cat.color, borderColor: cat.color }
              : {}
          }
          onClick={() => toggle(cat.id)}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
