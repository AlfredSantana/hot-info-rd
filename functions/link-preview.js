export async function onRequestGet(context) {
  const targetUrl = new URL(context.request.url).searchParams.get('url')

  if (!targetUrl) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HotInfoRDBot/1.0)' },
      cf: { cacheTtl: 3600, cacheEverything: true },
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false }), {
        headers: { 'content-type': 'application/json' },
      })
    }

    const meta = { title: '', image: '', siteName: '' }

    const rewriter = new HTMLRewriter()
      .on('meta[property="og:title"]', {
        element(el) { meta.title = el.getAttribute('content') || meta.title },
      })
      .on('meta[property="og:image"]', {
        element(el) { meta.image = el.getAttribute('content') || meta.image },
      })
      .on('meta[property="og:site_name"]', {
        element(el) { meta.siteName = el.getAttribute('content') || meta.siteName },
      })

    await rewriter.transform(res).arrayBuffer()

    return new Response(JSON.stringify({ ok: true, ...meta }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      headers: { 'content-type': 'application/json' },
    })
  }
}