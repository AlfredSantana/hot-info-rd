import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import ImageUpload from '../../components/ImageUpload.jsx'
import './Admin.css'
import SourcesEditor from './SourcesEditor.jsx'
import './SourcesEditor.css'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const emptyForm = {
  titulo: '',
  slug: '',
  cover_image: '',
  excerpt: '',
  contenido: '',
  categoria_id: '',
  autor_id: '',
  fuentes: [],
  published_at: new Date().toISOString().slice(0, 10),
  published: true,
}

export default function ArticleForm({ articleId }) {
  const isEditing = Boolean(articleId)
  const navigate = useNavigate()

  const [categorias, setCategorias] = useState([])
  const [autores, setAutores] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [slugEdited, setSlugEdited] = useState(isEditing)
  const [status, setStatus] = useState(null)
  const [loadingData, setLoadingData] = useState(isEditing)

  useEffect(() => {
    supabase.from('categorias').select('id, nombre').then(({ data }) => data && setCategorias(data))
    supabase.from('autores').select('id, nombre').then(({ data }) => {
      if (data) {
        setAutores(data)
        // Si hay un solo autor, lo preselecciona automáticamente (menos pasos al redactar)
        if (data.length === 1 && !isEditing) {
          setForm((prev) => ({ ...prev, autor_id: data[0].id }))
        }
      }
    })
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) return
    supabase
      .from('noticias')
      .select('*')
      .eq('id', articleId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setForm({
            titulo: data.titulo,
            slug: data.slug,
            cover_image: data.cover_image || '',
            excerpt: data.excerpt || '',
            contenido: data.contenido || '',
            categoria_id: data.categoria_id || '',
            autor_id: data.autor_id || '',
            fuentes: data.fuentes || [],
            published_at: data.published_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            published: data.published,
          })
        }
        setLoadingData(false)
      })
  }, [articleId, isEditing])

  function handleChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'titulo' && !slugEdited) next.slug = slugify(value)
      return next
    })
  }

  async function handleDelete() {
  if (!confirm('¿Eliminar esta noticia? Esta acción no se puede deshacer.')) return
  const { error } = await supabase.from('noticias').delete().eq('id', articleId)
  if (error) {
    alert('No se pudo eliminar: ' + error.message)
    return
  }
  navigate('/admin')
}

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('saving')

    const payload = {
      titulo: form.titulo,
      slug: form.slug,
      cover_image: form.cover_image,
      excerpt: form.excerpt,
      contenido: form.contenido,
      categoria_id: form.categoria_id,
      autor_id: form.autor_id || null,
      fuentes: form.fuentes,
      published_at: form.published_at,
      published: form.published,
    }

    const { error } = isEditing
      ? await supabase.from('noticias').update(payload).eq('id', articleId)
      : await supabase.from('noticias').insert(payload)

    if (error) {
      console.error(error)
      setStatus('error')
      return
    }

    setStatus('success')
    setTimeout(() => navigate('/admin'), 700)
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (loadingData) return <p>Cargando noticia…</p>

  return (
    <div className="admin-form-wrapper" onKeyDown={handleKeyDown}>
      <div className="admin-form-header">
        <h1>{isEditing ? 'Editar noticia' : 'Redactar noticia'}</h1>
        <p className="only-desktop">
          Completa los campos y publica. <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para guardar rápido.
        </p>
        <p className="only-mobile">Completa lo esencial y publica.</p>
      </div>

      {status === 'success' && <p className="admin-success">Guardado correctamente.</p>}
      {status === 'error' && <p className="admin-error">Ocurrió un error al guardar.</p>}

      <form className="admin-form" onSubmit={handleSubmit}>

        {/* Campos esenciales — siempre visibles */}
        <section className="admin-section">
          <label>
            Título
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              autoFocus
              required
            />
          </label>

          <label>
            Resumen
            <textarea rows={2} value={form.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} required />
          </label>

          <label>
            Contenido
            <textarea
              className="admin-textarea-content"
              value={form.contenido}
              onChange={(e) => handleChange('contenido', e.target.value)}
              placeholder="Admite HTML básico: <p>, <b>, <i>, <a>..."
              required
            />
          </label>

          <label>
            Imagen principal
            <ImageUpload value={form.cover_image} onChange={(url) => handleChange('cover_image', url)} />
          </label>

          <label>
            Categoría
            <select value={form.categoria_id} onChange={(e) => handleChange('categoria_id', e.target.value)} required>
              <option value="">Selecciona…</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </label>
        </section>

        {/* Opciones avanzadas — colapsadas para reducir scroll */}
        <details className="admin-advanced">
          <summary>Opciones avanzadas</summary>

          <div className="admin-section admin-advanced-content">
            <label>
              Slug (URL)
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setSlugEdited(true); handleChange('slug', e.target.value) }}
                required
              />
            </label>

            <label>
              Autor
              <select value={form.autor_id} onChange={(e) => handleChange('autor_id', e.target.value)}>
                <option value="">Sin asignar</option>
                {autores.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </label>

            <label>
  Fuentes (enlaces, imágenes o videos)
  <SourcesEditor value={form.fuentes} onChange={(fuentes) => handleChange('fuentes', fuentes)} />
</label>

            <div className="admin-form-row">
              <label>
                Fecha
                <input type="date" value={form.published_at} onChange={(e) => handleChange('published_at', e.target.value)} required />
              </label>

              <label className="admin-checkbox">
                <input type="checkbox" checked={form.published} onChange={(e) => handleChange('published', e.target.checked)} />
                Publicar ahora
              </label>
            </div>
          </div>
        </details>

        <div className="admin-form-actions">
  {isEditing && (
    <>
      <button type="button" onClick={() => navigate('/admin')} className="admin-btn-secondary">
        Cancelar
      </button>
      <button type="button" onClick={handleDelete} className="admin-btn-danger">
        Eliminar noticia
      </button>
    </>
  )}
  <button type="submit" className="admin-btn-primary" disabled={status === 'saving'}>
    {status === 'saving' ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Publicar noticia'}
  </button>
</div>
      </form>
    </div>
  )
}