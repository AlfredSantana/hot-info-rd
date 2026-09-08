export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const userAgent = request.headers.get('user-agent') || ''
    const isBot = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot/i.test(userAgent)

    // Redirect www -> root (dominio "desnudo"), preservando path y query string.
    // Los bots de redes sociales (WhatsApp, Facebook, etc.) NO deben ser redirigidos:
    // muchos no siguen el redirect y se quedan sin poder leer las meta-tags de la noticia.
    if (url.hostname.startsWith('www.') && !isBot) {
      url.hostname = url.hostname.replace(/^www\./, '')
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          'X-Worker-Debug': 'www-redirect-triggered', // <-- TEMPORAL: quitar cuando confirmemos que funciona
        },
      })
    }

    // Sitemap dinámico
    if (url.pathname === '/sitemap.xml') {
      return handleSitemap(env, url.origin)
    }

    // Meta tags para bots en páginas de noticia
    const articleMatch = url.pathname.match(/^\/noticia\/([^/]+)\/?$/)
    if (articleMatch && isBot) {
      const canonicalUrl = new URL(request.url)
      canonicalUrl.hostname = canonicalUrl.hostname.replace(/^www\./, '')
      return handleArticleMeta(env, articleMatch[1], canonicalUrl.toString())
    }

    // Todo lo demás: sirve el sitio normal (SPA)
    const response = await env.ASSETS.fetch(request)
    const debugHeaders = new Headers(response.headers)
    debugHeaders.set('X-Worker-Debug', 'worker-executed-fallthrough') // <-- TEMPORAL
    return new Response(response.body, { status: response.status, headers: debugHeaders })
  },
}

async function handleArticleMeta(env, slug, requestUrl) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/noticias?slug=eq.${slug}&published=eq.true&select=titulo,excerpt,cover_image,published_at,categorias!noticias_categoria_id_fkey(nombre)`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
  )

  const data = await res.json()

  if (!res.ok || !Array.isArray(data)) {
    console.error('Supabase error en handleArticleMeta:', JSON.stringify(data))
    return new Response('Error fetching article', { status: 502, headers: { 'X-Worker-Debug': 'supabase-error' } })
  }

  const [article] = data

  if (!article) {
    return new Response('Not found', { status: 404, headers: { 'X-Worker-Debug': 'article-not-found' } })
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

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=UTF-8', 'X-Worker-Debug': 'article-meta-served' },
  })
}

async function handleSitemap(env, siteUrl) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/noticias?published=eq.true&select=slug,published_at&order=published_at.desc`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
  )
  const noticias = await res.json()

  if (!res.ok || !Array.isArray(noticias)) {
    console.error('Supabase error en handleSitemap:', JSON.stringify(noticias))
    return new Response('Error generating sitemap', { status: 502 })
  }

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
  <url><loc>${siteUrl}/categoria/musica</loc><changefreq>daily</changefreq></url>
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
