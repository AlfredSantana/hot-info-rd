import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import './BreakingBar.css'

export default function BreakingBar() {
  const [items, setItems] = useState([])

  useEffect(() => {
    supabase
      .from('noticias')
      .select('slug, titulo')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6)
      .then(({ data }) => data && setItems(data))
  }, [])

  if (items.length === 0) return null

  return (
    <div className="breaking-bar">
      <span className="breaking-label">Última hora</span>
      <div className="breaking-track">
        <div className="breaking-scroll">
          {[...items, ...items].map((item, i) => (
            <Link key={i} to={`/noticia/${item.slug}`} className="breaking-item">
              {item.titulo}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}