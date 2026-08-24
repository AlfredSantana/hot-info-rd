import { Link } from "react-router-dom";
import "./ArticleCard.css";
import TrendingBadge from "./TrendingBadge.jsx";
import CategoryBadge from "./CategoryBadge.jsx";
import "./CategoryBadge.css";

export default function ArticleCard({ article }) {
  return (
    <Link to={`/noticia/${article.slug}`} className="article-card">
      <div className="article-card-image-wrapper">
        <img src={article.cover_image} alt={article.title} loading="lazy" />
        <TrendingBadge views={article.views} />
      </div>
      <div className="article-card-body">
        <div className="article-card-tags">
          <CategoryBadge
            nombre={article.category}
            color={article.categoryColor}
            size="sm"
          />
          {article.tags?.slice(0, 2).map((t, i) => (
            <CategoryBadge
              key={i}
              nombre={t.nombre}
              color={t.color}
              size="sm"
            />
          ))}
        </div>
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
      </div>
    </Link>
  );
}
