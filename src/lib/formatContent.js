export function formatArticleContent(raw) {
  if (!raw) return ''
  const hasBlockTags = /<(p|div|h[1-6]|ul|ol|li|blockquote)[\s>]/i.test(raw)
  if (hasBlockTags) return raw

  return raw
    .split(/\n{2,}/)
    .map((block) => `<p>${block.trim().replace(/\n/g, '<br />')}</p>`)
    .join('')
}