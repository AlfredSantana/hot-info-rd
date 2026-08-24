import SEO from "../components/SEO.jsx";
import "./PrivacyPolicy.css";

export default function TermsOfUse() {
  return (
    <>
      <SEO
        title="Términos de Uso — Hot Info RD"
        description="Términos y condiciones de uso de Hot Info RD."
        image="/og-default.jpg"
        url={`${window.location.origin}/terminos-de-uso`}
        type="website"
      />
      <article className="privacy-page">
        <h1>Términos de Uso</h1>
        <p>Última actualización: 24 de agosto de 2026.</p>

        <h2>Aceptación de los términos</h2>
        <p>
          Al acceder y usar Hot Info RD, aceptas estos términos de uso. Si no
          estás de acuerdo con ellos, te pedimos no utilizar el sitio.
        </p>

        <h2>Uso del contenido</h2>
        <p>
          El contenido publicado en Hot Info RD es de carácter informativo y de
          entretenimiento. Queda prohibida la reproducción total del contenido
          sin autorización previa. Se permite compartir enlaces y fragmentos con
          la debida atribución.
        </p>

        <h2>Contenido de terceros</h2>
        <p>
          Algunas noticias incluyen referencias, capturas o enlaces a
          publicaciones de redes sociales y otros medios. Estos se citan con
          fines informativos y pertenecen a sus respectivos autores.
        </p>

        <h2>Exactitud de la información</h2>
        <p>
          Hot Info RD se esfuerza por publicar información precisa y verificada,
          pero no garantiza la exactitud absoluta de todo el contenido. Si
          encuentras un error, puedes reportarlo a través de nuestro contacto.
        </p>

        <h2>Modificaciones</h2>
        <p>
          Estos términos pueden actualizarse en cualquier momento. El uso
          continuo del sitio implica la aceptación de los cambios.
        </p>

        <h2>Contacto</h2>
        <p>
          Para consultas, correcciones o reportes de contenido, puedes
          contactarnos a través de nuestras redes sociales.
        </p>
      </article>
    </>
  );
}
