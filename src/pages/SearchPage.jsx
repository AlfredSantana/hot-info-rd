import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import ArticleCard from "../components/ArticleCard.jsx";
import SEO from "../components/SEO.jsx";
import "./SearchPage.css";

const CATEGORIES = [
  { slug: "farandula", label: "Farándula" },
  { slug: "entretenimiento", label: "Entretenimiento" },
  { slug: "virales", label: "Virales" },
  { slug: "actualidad", label: "Actualidad" },
  { slug: "politica", label: "Política" },
  { slug: "salud", label: "Salud" },
  { slug: "tecnologia", label: "Tecnología" },
  { slug: "deportes", label: "Deportes" },
  { slug: "musica", label: "Música" },
];

function mapNoticia(n) {
  return {
    id: n.id,
    slug: n.slug,
    title: n.titulo,
    excerpt: n.excerpt,
    cover_image: n.cover_image,
    category: n.categorias?.nombre ?? "",
    categoryColor: n.categorias?.color ?? "#666",
    tags: [],
  };
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let active = true;
    setActiveFilter("all");

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("noticias")
      .select("*, categorias!noticias_categoria_id_fkey(nombre, slug, color)")
      .eq("published", true)
      .or(`titulo.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order("published_at", { ascending: false })
      .then(({ data, error }) => {
        if (active) {
          if (error) console.error("Error en búsqueda:", error);
          if (!error && data) setResults(data.map(mapNoticia));
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [query]);

  const filtered =
    activeFilter === "all"
      ? results
      : results.filter(
          (r) =>
            r.category.toLowerCase() ===
            CATEGORIES.find(
              (c) => c.slug === activeFilter,
            )?.label.toLowerCase(),
        );

  const categoriesInResults = CATEGORIES.filter((c) =>
    results.some((r) => r.category.toLowerCase() === c.label.toLowerCase()),
  );

  return (
    <>
      <SEO
        title={`Resultados para "${query}" — Hot Info RD`}
        description={`Noticias relacionadas con ${query}.`}
        image="/og-default.jpg"
        url={window.location.href}
        type="website"
      />
      <div className="search-page">
        <nav className="search-breadcrumb">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <span>Búsqueda</span>
        </nav>

        <div className="search-page-header">
          <h1>Resultados para "{query}"</h1>
          {!loading && (
            <span className="search-count">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {!loading && categoriesInResults.length > 1 && (
          <div className="search-filters">
            <button
              className={activeFilter === "all" ? "is-active" : ""}
              onClick={() => setActiveFilter("all")}
            >
              Todas
            </button>
            {categoriesInResults.map((c) => (
              <button
                key={c.slug}
                className={activeFilter === c.slug ? "is-active" : ""}
                onClick={() => setActiveFilter(c.slug)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {loading && <p>Buscando…</p>}
        {!loading && filtered.length === 0 && (
          <p>No se encontraron noticias.</p>
        )}

        <div className="search-grid">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </>
  );
}
