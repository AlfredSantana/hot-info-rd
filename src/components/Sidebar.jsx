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
    </aside>
  );
}
