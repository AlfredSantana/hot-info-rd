import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import ArticleCard from "../components/ArticleCard.jsx";
import PromoSlot from "../components/PromoSlot.jsx";
import SEO from "../components/SEO.jsx";
import "./CategoryPage.css";

const LABELS = {
  farandula: "Farándula",
  entretenimiento: "Entretenimiento",
  musica: "Música",
  virales: "Virales",
  actualidad: "Actualidad",
  nacionales: "Nacionales",
  internacionales: "Internacionales",
  politica: "Política",
  salud: "Salud",
  tecnologia: "Tecnología",
  deportes: "Deportes",
};

const PROMO_CATEGORY_TOP = [
  {
    image: "/promo/banner-redes-1600x686px.mp4",
    link: "https://instagram.com/hotinford",
    alt: "Síguenos en Instagram y Facebook",
  },
];

const PROMO_CATEGORY_MID = [
  {
    image: "/promo/banner-redes-1200x900px.mp4",
    link: "https://instagram.com/hotinford",
    alt: "Síguenos en Instagram y Facebook",
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

export default function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function fetchArticles() {
      const primaryQuery = supabase
        .from("noticias")
        .select(
          "*, categorias!noticias_categoria_id_fkey!inner(nombre, slug, color), noticia_tags(categorias(nombre, color))",
        )
        .eq("published", true)
        .eq("categorias.slug", category);

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
  const accentColor = articles[0]?.categoryColor || "var(--color-accent)";

  // Inserta el anuncio intermedio después del 4to artículo
  const firstBatch = articles.slice(0, 4);
  const restBatch = articles.slice(4);

  return (
    <>
      <SEO
        title={`${label} — Hot Info RD`}
        description={`Últimas noticias de ${label}.`}
        image="/og-default.jpg"
        url={`${window.location.origin}/categoria/${category}`}
        type="website"
      />

      <header className="category-header" style={{ "--accent": accentColor }}>
        <h1 className="category-title">{label}</h1>
        {!loading && (
          <p className="category-count">
            {articles.length}{" "}
            {articles.length === 1
              ? "noticia encontrada"
              : "noticias encontradas"}
          </p>
        )}
      </header>

      <div className="category-promo-wrapper">
        <PromoSlot items={PROMO_CATEGORY_TOP} aspectRatio="1600 / 686" />
      </div>

      <div className="category-content">
        {loading && <p className="category-status">Cargando…</p>}

        {!loading && articles.length === 0 && (
          <p className="category-status">No hay artículos en esta categoría.</p>
        )}

        {!loading && articles.length > 0 && (
          <>
            <section className="home-grid">
              {firstBatch.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </section>

            {restBatch.length > 0 && (
              <>
                <div className="category-promo-wrapper category-promo-mid">
                  <PromoSlot
                    items={PROMO_CATEGORY_MID}
                    aspectRatio="1200 / 900"
                  />
                </div>

                <section className="home-grid">
                  {restBatch.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
