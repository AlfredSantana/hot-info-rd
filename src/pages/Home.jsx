import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import ArticleCard from '../components/ArticleCard.jsx'
import FeaturedArticle from '../components/FeaturedArticle.jsx'
import Sidebar from '../components/Sidebar.jsx'
import CategorySection from '../components/CategorySection.jsx'
import SEO from '../components/SEO.jsx'
import './Home.css'

const SECTIONS = [
  { slug: 'farandula', label: 'Farándula' },
  { slug: 'entretenimiento', label: 'Entretenimiento' },
  { slug: 'virales', label: 'Virales' },
  { slug: 'actualidad', label: 'Actualidad' },
]

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

export default function Home() {
  const [articles, setArticles] = useState([])
  const [popular, setPopular] = useState([])
  const [sections, setSections] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function fetchData() {
      // Últimas noticias para hero + grid + sidebar
      const { data: latest, error } = await supabase
        .from('noticias')
        .select('*, categorias(nombre, slug)')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(20)

      // Últimas 4 por cada categoría, en paralelo
      const sectionQueries = SECTIONS.map((s) =>
        supabase
          .from('noticias')
          .select('*, categorias!inner(nombre, slug)')
          .eq('published', true)
          .eq('categorias.slug', s.slug)
          .order('published_at', { ascending: false })
          .limit(4)
      )
      const sectionResults = await Promise.all(sectionQueries)

      if (!active) return

      if (!error && latest) {
        const mapped = latest.map(mapNoticia)
        setArticles(mapped)
        setPopular(mapped.slice(1, 6))
      }

      const sectionMap = {}
      SECTIONS.forEach((s, i) => {
        const result = sectionResults[i]
        sectionMap[s.slug] = result.data ? result.data.map(mapNoticia) : []
      })
      setSections(sectionMap)

      setLoading(false)
    }

    fetchData()
    return () => { active = false }
  }, [])

  if (loading) return <p className="home-loading">Cargando…</p>
  if (articles.length === 0) return <p className="home-loading">No hay artículos aún.</p>

  const [featured, ...rest] = articles

  return (
    <>
      <SEO
        title="Hot Info RD — Noticias, farándula y entretenimiento"
        description="Las últimas noticias de farándula, entretenimiento, virales y actualidad de República Dominicana."
        image="/og-default.jpg"
        url={window.location.origin}
        type="website"
      />

      <FeaturedArticle article={featured} />

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
    </>
  )
}