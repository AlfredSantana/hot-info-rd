import { Link } from "react-router-dom";
import "./Footer.css";

const CATEGORIES = [
  { slug: "farandula", label: "Farándula" },
  { slug: "entretenimiento", label: "Entretenimiento" },
  { slug: "musica", label: "Música" },
  { slug: "virales", label: "Virales" },
  { slug: "actualidad", label: "Actualidad" },
  { slug: "politica", label: "Política" },
  { slug: "salud", label: "Salud" },
  { slug: "tecnologia", label: "Tecnología" },
  { slug: "deportes", label: "Deportes" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <img src="/logo.png" alt="Hot Info RD" className="footer-logo" />
          <p className="footer-tagline">
            Farándula, entretenimiento, virales y actualidad de República
            Dominicana.
          </p>
        </div>

        <div className="footer-col">
          <h3>Categorías</h3>
          <ul>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/categoria/${cat.slug}`}>{cat.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>Síguenos</h3>
          <div className="footer-social">
            <a
              href="https://www.facebook.com/hotinford/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="footer-social-icon"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/hotinford/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="footer-social-icon"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.5.5.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44 2.53c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.87.04-1.34.18-1.65.3-.42.16-.71.36-1.02.67-.31.31-.51.6-.67 1.02-.12.31-.26.78-.3 1.65C4.27 8.55 4.26 8.87 4.26 12s.01 3.45.06 4.5c.04.87.18 1.34.3 1.65.16.42.36.71.67 1.02.31.31.6.51 1.02.67.31.12.78.26 1.65.3 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.87-.04 1.34-.18 1.65-.3.42-.16.71-.36.67-1.02.31-.31.51-.6.67-1.02.12-.31.26-.78.3-1.65.05-1.05.06-1.37.06-4.5s-.01-3.45-.06-4.5c-.04-.87-.18-1.34-.3-1.65a2.7 2.7 0 0 0-.67-1.02 2.7 2.7 0 0 0-1.02-.67c-.31-.12-.78-.26-1.65-.3C14.99 3.81 14.67 3.8 12 3.8Zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28Zm0 1.8a3.34 3.34 0 1 0 0 6.68 3.34 3.34 0 0 0 0-6.68Zm5.34-1.99a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
              </svg>
            </a>

            <a
              href="https://x.com/HotInfoRD"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="footer-social-icon"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.24 2h3.14l-6.87 7.85L22.5 22h-6.32l-4.95-6.47L5.53 22H2.38l7.35-8.4L1.5 2h6.48l4.47 5.9L18.24 2Zm-1.1 18.17h1.74L7 3.75H5.13l12.01 16.42Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3>Legal</h3>
          <ul>
            <li>
              <Link to="/politica-de-privacidad">Política de Privacidad</Link>
            </li>
            <li>
              <Link to="/terminos-de-uso">Términos de Uso</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Hot Info RD. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
