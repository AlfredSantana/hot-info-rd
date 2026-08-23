import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import './Admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        
        <div className="admin-login-logo-link">
  <img src="/logo.png" alt="Hot Info RD" className="admin-login-logo" />
</div>

        <h1 className="admin-login-title">Acceso administrador</h1>
        <p className="admin-login-subtitle">Ingresa tus credenciales para gestionar noticias.</p>

        {error && <p className="admin-error">{error}</p>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            Correo
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="admin-btn-primary admin-login-submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Entrar'}
          </button>
        </form>

        <Link to="/" className="admin-login-back">← Volver al sitio</Link>
      </div>
    </div>
  )
}