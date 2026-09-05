import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import ArticleCard from "../components/ArticleCard.jsx";
import SEO from "../components/SEO.jsx";
import PromoSlot from "../components/PromoSlot.jsx";
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

const AD_SEARCH_TOP = [
  {
    image: "/promo/banner-redes-1600x200px.mp4",
    link: "https://instagram.com/hotinford",
  },
];
const AD_SEARCH_MID = [
  {
    image: "/promo/banner-redes-960x300px.mp4",
    link: "https://instagram.com/hotinford",
  },
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
    tags: (n.noticia_tags || []).map((t) => t.categorias).filter(Boolean),
  };
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setLocalQuery(query);
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
      .select(
        "*, categorias!noticias_categoria_id_fkey(nombre, slug, color), noticia_tags(categorias(nombre, slug, color))",
      )
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

  function handleSearch(e) {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  }

  function articleHasCategory(article, slug) {
    const label = CATEGORIES.find((c) => c.slug === slug)?.label.toLowerCase();
    if (!label) return false;
    if (article.category.toLowerCase() === label) return true;
    return article.tags.some((t) => t.nombre.toLowerCase() === label);
  }

  const filtered =
    activeFilter === "all"
      ? results
      : results.filter((r) => articleHasCategory(r, activeFilter));

  const categoriesInResults = CATEGORIES.filter((c) =>
    results.some((r) => articleHasCategory(r, c.slug)),
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

        {/* Nueva barra de búsqueda interactiva */}
        <form onSubmit={handleSearch} className="search-page-bar">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Buscar más noticias..."
            autoFocus
          />
          <button type="submit">Buscar</button>
        </form>

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

        {/* Anuncio Superior */}
        {query && (
          <div style={{ marginBottom: "2rem" }}>
            <PromoSlot items={AD_SEARCH_TOP} aspectRatio="1600 / 200" />
          </div>
        )}

        {loading && <div className="search-empty-state">Buscando…</div>}

        {!loading && query && filtered.length === 0 && (
          <div className="search-empty-state">
            No encontramos noticias relacionadas con "<strong>{query}</strong>".
            Prueba con otras palabras.
          </div>
        )}

        {/* Cuadrícula de resultados con anuncio dinámico en medio */}
        {!loading && filtered.length > 0 && (
          <div className="search-grid">
            {filtered.slice(0, 6).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}

            {/* Inyecta el anuncio dinámico si hay más de 6 resultados */}
            {filtered.length > 6 && (
              <div className="search-ad-span">
                <PromoSlot items={AD_SEARCH_MID} aspectRatio="960 / 300" />
              </div>
            )}

            {filtered.slice(6).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
