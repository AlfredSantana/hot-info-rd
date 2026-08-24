export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const userAgent = request.headers.get('user-agent') || ''
    const isBot = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot/i.test(userAgent)

    // Sitemap dinámico
    if (url.pathname === '/sitemap.xml') {
      return handleSitemap(env, url.origin)
    }

    // Meta tags para bots en páginas de noticia
    const articleMatch = url.pathname.match(/^\/noticia\/([^/]+)\/?$/)
    if (articleMatch && isBot) {
      return handleArticleMeta(env, articleMatch[1], request.url)
    }

    // Todo lo demás: sirve el sitio normal (SPA)
    return env.ASSETS.fetch(request)
  },
}

async function handleArticleMeta(env, slug, requestUrl) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/noticias?slug=eq.${slug}&published=eq.true&select=titulo,excerpt,cover_image,published_at,categorias(nombre)`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
  )
  const [article] = await res.json()

  if (!article) {
    return new Response('Not found', { status: 404 })
  }

  const image = article.cover_image || `${new URL(requestUrl).origin}/og-default.jpg`
  const fullTitle = `${article.titulo} — Hot Info RD`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(article.excerpt ?? '')}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(fullTitle)}" />
  <meta property="og:description" content="${escapeHtml(article.excerpt ?? '')}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${requestUrl}" />
  <meta property="og:site_name" content="Hot Info RD" />
  <meta property="og:locale" content="es_DO" />
  <meta property="article:published_time" content="${article.published_at ?? ''}" />
  <meta property="article:section" content="${escapeHtml(article.categorias?.nombre ?? '')}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(article.excerpt ?? '')}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`

  return new Response(html, { headers: { 'content-type': 'text/html; charset=UTF-8' } })
}

async function handleSitemap(env, siteUrl) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/noticias?published=eq.true&select=slug,published_at&order=published_at.desc`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
  )
  const noticias = await res.json()

  const urls = noticias.map((n) => `
  <url>
    <loc>${siteUrl}/noticia/${n.slug}</loc>
    <lastmod>${new Date(n.published_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
  </url>`).join('')

  const staticUrls = `
  <url><loc>${siteUrl}/</loc><changefreq>hourly</changefreq></url>
  <url><loc>${siteUrl}/categoria/farandula</loc><changefreq>daily</changefreq></url>
  <url><loc>${siteUrl}/categoria/entretenimiento</loc><changefreq>daily</changefreq></url>
  <url><loc>${siteUrl}/categoria/virales</loc><changefreq>daily</changefreq></url>
  <url><loc>${siteUrl}/categoria/actualidad</loc><changefreq>daily</changefreq></url>
  <url><loc>${siteUrl}/categoria/politica</loc><changefreq>daily</changefreq></url>
  <url><loc>${siteUrl}/categoria/salud</loc><changefreq>daily</changefreq></url>
  <url><loc>${siteUrl}/categoria/tecnologia</loc><changefreq>daily</changefreq></url>
  <url><loc>${siteUrl}/categoria/deportes</loc><changefreq>daily</changefreq></url>`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${urls}
</urlset>`

  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=UTF-8' } })
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}