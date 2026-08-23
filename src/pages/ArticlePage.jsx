import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { formatArticleContent } from '../lib/formatContent.js'
import SEO from '../components/SEO.jsx'
import ShareButtons from '../components/ShareButtons.jsx'
import RelatedArticles from '../components/RelatedArticles.jsx'
import SourcesDisplay from '../components/SourcesDisplay.jsx'
import './ArticlePage.css'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/formatDate.js'

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session))
}, [])

  useEffect(() => {
    let active = true
    async function fetchArticle() {
      const { data, error } = await supabase
        .from('noticias')
        .select('*, categorias(nombre, slug), autores(nombre, avatar_url)')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (active) {
        if (!error) setArticle(data)
        setLoading(false)
      }
    }
    fetchArticle()
    return () => { active = false }
  }, [slug])

  if (loading) return <div className="article-loading">Cargando…</div>
  if (!article) return <div className="article-loading">Artículo no encontrado</div>

  const url = `${window.location.origin}/noticia/${article.slug}`
  const formattedDate = formatDate(article.published_at)

  return (
    <>
      <SEO
        title={article.titulo}
        description={article.excerpt}
        image={article.cover_image}
        url={url}
        type="article"
        publishedTime={article.published_at}
        section={article.categorias?.nombre}
      />
      {session && (
  <Link to={`/admin/editar/${article.id}`} className="article-admin-edit">
    ✎ Editar esta noticia
  </Link>
)}
      <article className="article">
        <span className="tag-category">{article.categorias?.nombre}</span>
        <h1>{article.titulo}</h1>

        <div className="article-meta">
          {article.autores?.nombre && <span>Por {article.autores.nombre}</span>}
          {article.autores?.nombre && formattedDate && <span className="article-meta-dot">·</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </div>

        <img src={article.cover_image} alt={article.titulo} className="article-cover" />

        <ShareButtons url={url} title={article.titulo} />

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: formatArticleContent(article.contenido) }}
        />
      </article>

      <SourcesDisplay sources={article.fuentes} />
      <RelatedArticles categoriaId={article.categoria_id} currentId={article.id} />
    </>
  )
}