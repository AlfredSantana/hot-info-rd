import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import ArticleCard from '../components/ArticleCard.jsx'
import SEO from '../components/SEO.jsx'
import './CategoryPage.css'

const LABELS = {
  farandula: 'Farándula',
  entretenimiento: 'Entretenimiento',
  virales: 'Virales',
  actualidad: 'Actualidad',
}

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

export default function CategoryPage() {
  const { category } = useParams()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    async function fetchArticles() {
      const { data, error } = await supabase
        .from('noticias')
        .select('*, categorias!inner(nombre, slug)')
        .eq('published', true)
        .eq('categorias.slug', category)
        .order('published_at', { ascending: false })

      if (active) {
        if (!error && data) setArticles(data.map(mapNoticia))
        setLoading(false)
      }
    }
    fetchArticles()
    return () => { active = false }
  }, [category])

  const label = LABELS[category] ?? category

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
        {!loading && articles.length === 0 && <p>No hay artículos en esta categoría.</p>}
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
    </>
  )
}