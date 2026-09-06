import SEO from "../components/SEO.jsx";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Política de Privacidad"
        description="Política de privacidad y uso de cookies de Hot Info RD."
        image="/og-default.jpg"
        url={`${window.location.origin}/politica-de-privacidad`}
        type="website"
      />
      <article className="privacy-page">
        <h1>Política de Privacidad</h1>
        <p>Última actualización: 20 de agosto de 2026.</p>

        <h2>Información que recopilamos</h2>
        <p>
          Hot Info RD puede recopilar información no personal, como el tipo de
          navegador, páginas visitadas y tiempo de permanencia, con fines
          estadísticos y de mejora del sitio.
        </p>

        <h2>Cookies y publicidad</h2>
        <p>
          Este sitio utiliza cookies propias y de terceros, incluyendo Google
          AdSense, para mostrar anuncios relevantes. Google puede usar cookies
          de DoubleClick para mostrar anuncios según visitas previas a este u
          otros sitios web. Puedes inhabilitar el uso de cookies de
          personalización de anuncios visitando la configuración de anuncios de
          Google.
        </p>

        <h2>Enlaces a terceros</h2>
        <p>
          Este sitio puede contener enlaces a redes sociales u otros sitios
          externos. No somos responsables de las políticas de privacidad de
          dichos sitios.
        </p>

        <h2>Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política, puedes contactarnos a través
          de nuestras redes sociales o correo de contacto.
        </p>
      </article>
    </>
  );
}
