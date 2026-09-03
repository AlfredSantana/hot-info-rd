export function formatArticleContent(content) {
  if (!content) return "";
  
  // Divide el texto por cada doble salto de línea (Enter)
  const paragraphs = content.split(/\n\s*\n/);
  
  const formatted = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return "";

    // Si el bloque de texto empieza y termina con etiquetas HTML (como el de Instagram), 
    // lo respetamos y NO lo metemos dentro de un <p>
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      return trimmed;
    }
    
    // Si es texto normal, lo envolvemos en un párrafo y respetamos los saltos simples
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  return formatted.join('\n');
}