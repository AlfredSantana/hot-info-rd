import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import ArticleCard from '../components/ArticleCard.jsx'
import SEO from '../components/SEO.jsx'
import './SearchPage.css'

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

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('noticias')
      .select('*, categorias(nombre, slug)')
      .eq('published', true)
      .or(`titulo.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .then(({ data, error }) => {
        if (active) {
          if (!error && data) setResults(data.map(mapNoticia))
          setLoading(false)
        }
      })

    return () => { active = false }
  }, [query])

  return (
    <>
      <SEO
        title={`Resultados para "${query}" — Hot Info RD`}
        description={`Noticias relacionadas con ${query}.`}
        image="/og-default.jpg"
        url={window.location.href}
        type="website"
      />
      <div className="search-page">
        <h1>Resultados para "{query}"</h1>
        {loading && <p>Buscando…</p>}
        {!loading && results.length === 0 && <p>No se encontraron noticias.</p>}
        <div className="search-grid">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </>
  )
}