export async function onRequest(context) {
  const { env } = context
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY
  const siteUrl = 'https://hotinfo.rd'

  const res = await fetch(
    `${supabaseUrl}/rest/v1/noticias?published=eq.true&select=slug,published_at&order=published_at.desc`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
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
  <url><loc>${siteUrl}/categoria/actualidad</loc><changefreq>daily</changefreq></url>`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${urls}
</urlset>`

  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=UTF-8' } })
}