import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import ArticleCard from "../components/ArticleCard.jsx";
import SEO from "../components/SEO.jsx";
import "./CategoryPage.css";

const LABELS = {
  farandula: "Farándula",
  entretenimiento: "Entretenimiento",
  virales: "Virales",
  actualidad: "Actualidad",
  politica: "Política",
  salud: "Salud",
  tecnologia: "Tecnología",
  deportes: "Deportes",
  musica: "Música",
};

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

export default function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function fetchArticles() {
      // 1. Noticias donde esta categoría es la principal
      const primaryQuery = supabase
        .from("noticias")
        .select(
          "*, categorias!noticias_categoria_id_fkey!inner(nombre, slug, color), noticia_tags(categorias(nombre, color))",
        )
        .eq("published", true)
        .eq("categorias.slug", category);

      // 2. Noticias donde esta categoría es un tag secundario
      const tagQuery = supabase
        .from("noticia_tags")
        .select(
          "noticias!inner(*, categorias!noticias_categoria_id_fkey(nombre, slug, color), noticia_tags(categorias(nombre, color))), categorias!inner(slug)",
        )
        .eq("categorias.slug", category)
        .eq("noticias.published", true);

      const [primaryRes, tagRes] = await Promise.all([primaryQuery, tagQuery]);

      if (!active) return;

      const primaryArticles = primaryRes.data || [];
      const tagArticles = (tagRes.data || []).map((row) => row.noticias);

      // Fusiona sin duplicados (por id)
      const seen = new Set();
      const combined = [...primaryArticles, ...tagArticles].filter((n) => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });

      combined.sort(
        (a, b) => new Date(b.published_at) - new Date(a.published_at),
      );

      setArticles(combined.map(mapNoticia));
      setLoading(false);
    }

    fetchArticles();
    return () => {
      active = false;
    };
  }, [category]);

  const label = LABELS[category] ?? category;

  return (
    <>
      <SEO
        title={`${label} — Hot Info RD`}
        description={`Últimas noticias de ${label}.`}
        image="/og-default.jpg"
        url={`${window.location.origin}/categoria/${category}`}
        type="website"
      />
      <h1 className="category-title">{label}</h1>
      <section className="home-grid">
        {loading && <p>Cargando…</p>}
        {!loading && articles.length === 0 && (
          <p>No hay artículos en esta categoría.</p>
        )}
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
    </>
  );
}
