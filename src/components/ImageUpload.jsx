import { useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { compressImage } from '../lib/compressImage.js'
import './ImageUpload.css'

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const compressed = await compressImage(file)

      const fileExt = compressed.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('noticias')
        .upload(fileName, compressed, {
          contentType: compressed.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error de Supabase Storage:', uploadError)
        setError(`Error al subir: ${uploadError.message}`)
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from('noticias').getPublicUrl(fileName)
      onChange(data.publicUrl)
    } catch (err) {
      console.error('Error al comprimir imagen:', err)
      setError('No se pudo procesar la imagen. Intenta con otro archivo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-upload">
      {value && (
        <img src={value} alt="Vista previa" className="image-upload-preview" />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="image-upload-input-hidden"
        id="image-upload-input"
      />
      <label htmlFor="image-upload-input" className="image-upload-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {uploading ? 'Optimizando y subiendo…' : value ? 'Cambiar imagen' : 'Subir imagen'}
      </label>

      {error && <p className="image-upload-error">{error}</p>}

      <details className="image-upload-alt">
        <summary>O pega una URL de imagen</summary>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      </details>
    </div>
  )
}