import "./TrendingBadge.css";

const THRESHOLD = 1; // vistas mínimas para mostrar el badge

export default function TrendingBadge({ views }) {
  if (!views || views < THRESHOLD) return null;

  return (
    <span className="trending-badge">
      <img src="/view.svg" alt="" className="trending-badge-icon" />
      {views}
    </span>
  );
}
