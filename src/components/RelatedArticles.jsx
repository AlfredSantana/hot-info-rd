import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import ArticleCard from "./ArticleCard.jsx";
import "./RelatedArticles.css";
import { Link } from "react-router-dom";

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

export default function RelatedArticles({
  categoriaId,
  tagIds = [],
  currentId,
  compact = false,
}) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const allCategoryIds = [categoriaId, ...tagIds].filter(Boolean);
    if (allCategoryIds.length === 0) return;

    async function fetchRelated() {
      // Noticias donde la categoría principal coincide con cualquiera de los ids
      const primaryQuery = supabase
        .from("noticias")
        .select(
          "*, categorias!noticias_categoria_id_fkey(nombre, slug, color), noticia_tags(categorias(nombre, color))",
        )
        .eq("published", true)
        .neq("id", currentId)
        .in("categoria_id", allCategoryIds)
        .order("published_at", { ascending: false })
        .limit(6);

      // Noticias donde alguno de sus tags coincide
      const tagQuery = supabase
        .from("noticia_tags")
        .select(
          "noticias!inner(*, categorias!noticias_categoria_id_fkey(nombre, slug, color), noticia_tags(categorias(nombre, color)))",
        )
        .in("categoria_id", allCategoryIds)
        .neq("noticia_id", currentId)
        .eq("noticias.published", true)
        .limit(6);

      const [primaryRes, tagRes] = await Promise.all([primaryQuery, tagQuery]);

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
      setRelated(combined.slice(0, 3).map(mapNoticia));
    }

    fetchRelated();
  }, [categoriaId, tagIds, currentId]);

  if (related.length === 0) return null;

  return (
    <section
      className={`related-articles ${compact ? "related-articles-compact" : ""}`}
    >
      <h2>Te puede interesar</h2>
      <div className={compact ? "related-list-compact" : "related-grid"}>
        {related.map((article) =>
          compact ? (
            <Link
              key={article.id}
              to={`/noticia/${article.slug}`}
              className="related-compact-item"
            >
              <img src={article.cover_image} alt={article.title} />
              <span>{article.title}</span>
            </Link>
          ) : (
            <ArticleCard key={article.id} article={article} />
          ),
        )}
      </div>
    </section>
  );
}
