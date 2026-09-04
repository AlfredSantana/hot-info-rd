import { Link } from "react-router-dom";
import "./Sidebar.css";
import PromoSlot from "./PromoSlot.jsx";

const PROMO_SIDEBAR = [
  {
    image: "/promo/banner-redes-1000x1250px.mp4",
    link: "https://instagram.com/hotinford",
    alt: "Síguenos en Instagram y Facebook",
  },
];

export default function Sidebar({ articles }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Lo más popular</h2>
      <ol className="sidebar-list">
        {articles.map((article, i) => (
          <li key={article.id}>
            <Link to={`/noticia/${article.slug}`} className="sidebar-item">
              <span className="sidebar-rank">{i + 1}</span>
              <span className="sidebar-item-title">{article.title}</span>
            </Link>
          </li>
        ))}
      </ol>

      <PromoSlot items={PROMO_SIDEBAR} aspectRatio="1000 / 1250" />

      {/* Widget de Facebook */}
      <div
        style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}
      >
        <iframe
          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fhotinford&tabs=timeline&width=320&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true"
          width="320"
          height="500"
          style={{
            border: "none",
            overflow: "hidden",
            borderRadius: "var(--radius)",
          }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title="Perfil de Facebook Hot Info RD"
        />
      </div>
    </aside>
  );
}
