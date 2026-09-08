import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Dispara un evento page_view a Google Analytics (GA4) cada vez que
// cambia la ruta. Como en index.html desactivamos el env\u00edo autom\u00e1tico
// (send_page_view: false), este componente es el \u00fanico responsable de
// avisarle a Analytics cu\u00e1ndo el usuario "entra" a una p\u00e1gina nueva,
// incluyendo la primera carga del sitio.
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}
