import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import ArticleCard from "../components/ArticleCard.jsx";
import FeaturedCarousel from "../components/FeaturedCarousel.jsx";
import Sidebar from "../components/Sidebar.jsx";
import CategorySection from "../components/CategorySection.jsx";
import SEO from "../components/SEO.jsx";
import "./Home.css";
import PromoSlot from "../components/PromoSlot.jsx";
import { Link } from "react-router-dom";
import { useSession } from "../lib/useSession.js";

const PROMO_HOME = [
  {
    image: "/promo/banner-redes-1600x686px.mp4",
    link: "https://instagram.com/hotinford",
    alt: "Síguenos en Instagram y Facebook",
  },
];

const PROMO_ARTICLE = [
  {
    image: "/promo/banner-redes-1000x1250px.mp4",
    link: "https://instagram.com/hotinford",
    alt: "Síguenos en Instagram y Facebook",
  },
];

const SECTIONS = [
  { slug: "farandula", label: "Farándula" },
  { slug: "entretenimiento", label: "Entretenimiento" },
  { slug: "musica", label: "Música" },
  { slug: "virales", label: "Virales" },
  { slug: "actualidad", label: "Actualidad" },
  { slug: "nacionales", label: "Nacionales" },
  { slug: "internacionales", label: "Internacionales" },
  { slug: "politica", label: "Política" },
  { slug: "salud", label: "Salud" },
  { slug: "tecnologia", label: "Tecnología" },
  { slug: "deportes", label: "Deportes" },
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
    views: n.views,
    tags: (n.noticia_tags || []).map((t) => t.categorias).filter(Boolean),
  };
}

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [popular, setPopular] = useState([]);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    let active = true;

    async function fetchData() {
      // Últimas noticias para hero + grid + sidebar
      const { data: latest, error } = await supabase
        .from("noticias")
        .select(
          "*, categorias!noticias_categoria_id_fkey(nombre, slug, color), noticia_tags(categorias(nombre, color))",
        )
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(20);

      // Últimas 4 por cada categoría, en paralelo
      const sectionQueries = SECTIONS.map((s) =>
        supabase
          .from("noticias")
          .select(
            "*, categorias!noticias_categoria_id_fkey!inner(nombre, slug, color), noticia_tags(categorias(nombre, color))",
          )
          .eq("published", true)
          .eq("categorias.slug", s.slug)
          .order("published_at", { ascending: false })
          .limit(4),
      );
      const sectionResults = await Promise.all(sectionQueries);

      if (!active) return;

      if (!error && latest) {
        const mapped = latest.map(mapNoticia);
        setArticles(mapped);
        const sorted = [...mapped].sort(
          (a, b) => (b.views || 0) - (a.views || 0),
        );
        setPopular(sorted.slice(0, 5));
      }

      const sectionMap = {};
      SECTIONS.forEach((s, i) => {
        const result = sectionResults[i];
        sectionMap[s.slug] = result.data ? result.data.map(mapNoticia) : [];
      });
      setSections(sectionMap);

      setLoading(false);
    }

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="home-loading">Cargando…</p>;
  if (articles.length === 0)
    return <p className="home-loading">No hay artículos aún.</p>;

  const [featured, ...rest] = articles;

  return (
    <>
      <SEO
        title="Hot Info RD — Noticias, farándula y entretenimiento"
        description="Las últimas noticias de farándula, entretenimiento, virales y actualidad de República Dominicana."
        image="/og-default.jpg"
        url={window.location.origin}
        type="website"
      />

      <FeaturedCarousel articles={articles.slice(0, 5)} />

      <PromoSlot items={PROMO_HOME} aspectRatio="1600 / 686" />

      <div className="home-layout">
        <section className="home-grid">
          {rest.slice(0, 4).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>

        <Sidebar articles={popular} />
      </div>

      {SECTIONS.map((s) => (
        <CategorySection
          key={s.slug}
          title={s.label}
          slug={s.slug}
          articles={sections[s.slug]}
        />
      ))}

      {/* Nuevo anuncio al fondo del inicio */}
      <div className="home-bottom-promo">
        <PromoSlot items={PROMO_ARTICLE} aspectRatio="1000 / 1250" />
      </div>

      {session && (
        <Link
          to="/admin/nueva-noticia"
          className="home-new-article-btn"
          aria-label="Crear nueva noticia"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva noticia
        </Link>
      )}
    </>
  );
}
