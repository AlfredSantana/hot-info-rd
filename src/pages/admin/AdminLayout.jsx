import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import "./Admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <Link to="/" className="admin-logo-link" aria-label="Volver al inicio">
          <img src="/logo.png" alt="Hot Info RD" className="admin-logo" />
        </Link>

        <nav className="admin-nav">
          <NavLink
            to="/admin/redactores"
            className={({ isActive }) => (isActive ? "is-active" : "")}
          >
            Redactores
          </NavLink>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? "is-active" : "")}
          >
            Noticias
          </NavLink>

          <button onClick={handleLogout} className="admin-logout">
            Cerrar sesión
          </button>
        </nav>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
