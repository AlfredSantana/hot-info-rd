export default function CategoryBadge({ nombre, color, size = "md" }) {
  return (
    <span
      className={`category-badge category-badge-${size}`}
      style={{ background: color || "#666" }}
    >
      {nombre}
    </span>
  );
}
