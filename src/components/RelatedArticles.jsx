import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import ArticleCard from './ArticleCard.jsx'
import './RelatedArticles.css'

function mapNoticia(n) {
  return {
    id: n.id,
    slug: n.slug,
    title: n.titulo,
    excerpt: n.excerpt,
    cover_image: n.cover_image,
    category: n.categorias?.nombre ?? '',
  }
}

export default function RelatedArticles({ categoriaId, currentId }) {
  const [related, setRelated] = useState([])

  useEffect(() => {
    if (!categoriaId) return
    supabase
      .from('noticias')
      .select('*, categorias(nombre, slug)')
      .eq('published', true)
      .eq('categoria_id', categoriaId)
      .neq('id', currentId)
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }) => data && setRelated(data.map(mapNoticia)))
  }, [categoriaId, currentId])

  if (related.length === 0) return null

  return (
    <section className="related-articles">
      <h2>Te puede interesar</h2>
      <div className="related-grid">
        {related.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}