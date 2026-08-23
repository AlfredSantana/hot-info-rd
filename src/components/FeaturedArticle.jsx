import { Link } from 'react-router-dom'
import './FeaturedArticle.css'

export default function FeaturedArticle({ article }) {
  return (
    <Link to={`/noticia/${article.slug}`} className="featured">
      <img src={article.cover_image} alt={article.title} />
      <div className="featured-body">
        <span className="featured-category">{article.category}</span>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
      </div>
    </Link>
  )
}