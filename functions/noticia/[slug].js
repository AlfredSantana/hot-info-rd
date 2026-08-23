export async function onRequest(context) {
  const { params, env, next } = context
  const userAgent = context.request.headers.get('user-agent') || ''

  const isBot = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot/i.test(userAgent)
  if (!isBot) return next()

  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY

  const res = await fetch(
    `${supabaseUrl}/rest/v1/noticias?slug=eq.${params.slug}&published=eq.true&select=titulo,excerpt,cover_image,published_at,categorias(nombre)`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  )
  const [article] = await res.json()
  if (!article) return next()

  const image = article.cover_image || `${new URL(context.request.url).origin}/og-default.jpg`
  const fullTitle = `${article.titulo} — Hot Info RD`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${fullTitle}</title>
  <meta name="description" content="${article.excerpt ?? ''}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${fullTitle}" />
  <meta property="og:description" content="${article.excerpt ?? ''}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${context.request.url}" />
  <meta property="og:site_name" content="Hot Info RD" />
  <meta property="og:locale" content="es_DO" />
  <meta property="article:published_time" content="${article.published_at ?? ''}" />
  <meta property="article:section" content="${article.categorias?.nombre ?? ''}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${fullTitle}" />
  <meta name="twitter:description" content="${article.excerpt ?? ''}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`

  return new Response(html, { headers: { 'content-type': 'text/html; charset=UTF-8' } })
}