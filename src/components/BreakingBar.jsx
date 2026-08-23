import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import './BreakingBar.css'

const PIXELS_PER_SECOND = 55

export default function BreakingBar() {
  const [items, setItems] = useState([])
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)
  const positionRef = useRef(0)
  const frameRef = useRef(null)

  useEffect(() => {
    supabase
      .from('noticias')
      .select('slug, titulo')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setItems(data)
      })
  }, [])

  useEffect(() => {
    if (items.length === 0) return

    const el = trackRef.current
    if (!el) return

    let lastTime = null

    function step(time) {
      if (lastTime === null) lastTime = time
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (!paused) {
        positionRef.current += PIXELS_PER_SECOND * delta

        const singleCopyWidth = el.scrollWidth / 3
        if (singleCopyWidth > 0 && positionRef.current >= singleCopyWidth) {
          positionRef.current -= singleCopyWidth
        }

        el.style.transform = `translateX(-${positionRef.current}px)`
      }

      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [items, paused])

  if (items.length === 0) return null

  return (
    <div className="breaking-bar">
      <span className="breaking-label">Última hora</span>
      <div className="breaking-track">
        <div
          className="breaking-scroll"
          ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <Link key={i} to={`/noticia/${item.slug}`} className="breaking-item">
              {item.titulo}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}