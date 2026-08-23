import { Link } from 'react-router-dom'
import ArticleCard from './ArticleCard.jsx'
import './CategorySection.css'

export default function CategorySection({ title, slug, articles }) {
  if (!articles || articles.length === 0) return null

  return (
    <section className="category-section">
      <div className="category-section-header">
        <h2>{title}</h2>
        <Link to={`/categoria/${slug}`} className="category-section-more">
          Ver más →
        </Link>
      </div>

      <div className="category-section-grid">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}