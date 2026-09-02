import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import SearchBar from "./SearchBar.jsx";
import "./Navbar.css";

const CATEGORIES = [
  { slug: "farandula", label: "Farándula" },
  { slug: "entretenimiento", label: "Entretenimiento" },
  { slug: "musica", label: "Música" },
  { slug: "virales", label: "Virales" },
  { slug: "actualidad", label: "Actualidad" },
  { slug: "nacionales", label: "Nacionales" },
  { slug: "internacionales", label: "Internacionales" },
  { slug: "politica", label: "Política" },
  { slug: "salud", label: "Salud" },
  { slug: "tecnologia", label: "Tecnología" },
  { slug: "deportes", label: "Deportes" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  function closeMenu() {
    setOpen(false);
    setSearchOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    closeMenu();
  }

  return (
    <header className="navbar">
      <div className="navbar-bar">
        <button
          className="navbar-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src="/logo.png" alt="Hot Info RD" />
        </Link>

        <nav className="navbar-links navbar-links-desktop">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={`/categoria/${cat.slug}`}>
              {cat.label}
            </Link>
          ))}
          <SearchBar />

          {session ? (
            <div className="navbar-session">
              <Link to="/admin" className="navbar-admin-btn">
                Administrar
              </Link>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="navbar-login-btn">
              Acceder
            </Link>
          )}
        </nav>

        <button
          className="navbar-search-toggle"
          onClick={() => setSearchOpen((prev) => !prev)}
          aria-label="Buscar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {searchOpen && (
        <div className="navbar-search-panel">
          <SearchBar onSubmit={closeMenu} />
        </div>
      )}

      <nav
        className={`navbar-links navbar-links-mobile ${open ? "is-open" : ""}`}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/categoria/${cat.slug}`}
            onClick={closeMenu}
          >
            {cat.label}
          </Link>
        ))}

        {session ? (
          <>
            <Link
              to="/admin"
              onClick={closeMenu}
              className="navbar-admin-link-mobile"
            >
              Panel de administración
            </Link>
            <button
              onClick={handleLogout}
              className="navbar-logout-link-mobile"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link
            to="/admin/login"
            onClick={closeMenu}
            className="navbar-admin-link-mobile"
          >
            Acceder
          </Link>
        )}
      </nav>

      {open && <div className="navbar-overlay" onClick={closeMenu} />}
    </header>
  );
}
