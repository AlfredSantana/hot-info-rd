import { useSession } from "../lib/useSession.js";
import "./TrendingBadge.css";

const THRESHOLD = 50;

export default function TrendingBadge({ views }) {
  const session = useSession();

  if (!session) return null;
  if (!views || views < THRESHOLD) return null;

  return (
    <span className="trending-badge">
      <img src="/view.svg" alt="" className="trending-badge-icon" />
      {views}
    </span>
  );
}
