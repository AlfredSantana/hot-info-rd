export function formatArticleContent(content) {
  if (!content) return "";
  
  // Divide el texto por cada doble salto de línea (Enter)
  const paragraphs = content.split(/\n\s*\n/);
  
  const formatted = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return "";

    // Solo evitamos crear el párrafo si es un código complejo (Instagram, YouTube, etc)
    const isEmbed = trimmed.startsWith('<blockquote') || 
                    trimmed.startsWith('<iframe') || 
                    trimmed.startsWith('<div') || 
                    trimmed.startsWith('<script');

    if (isEmbed) {
      return trimmed; // Lo deja intacto (para Instagram)
    }
    
    // Si es texto normal, negrita <b> o cursiva <i>, lo envuelve en <p> y le da su espaciado
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  return formatted.join('\n');
}