import { Link } from 'react-router-dom'
import './ArticleCard.css'

export default function ArticleCard({ article }) {
  return (
    <Link to={`/noticia/${article.slug}`} className="article-card">
      <img src={article.cover_image} alt={article.title} loading="lazy" />
      <div className="article-card-body">
        <span className="article-card-category">{article.category}</span>
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
      </div>
    </Link>
  )
}