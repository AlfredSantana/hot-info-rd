import "./TrendingBadge.css";

const THRESHOLD = 50; // vistas mínimas para mostrar el badge

export default function TrendingBadge({ views }) {
  if (!views || views < THRESHOLD) return null;

  return (
    <span className="trending-badge">
      <img src="/favicon.ico" alt="" className="trending-badge-icon" />
      {views}
    </span>
  );
}
