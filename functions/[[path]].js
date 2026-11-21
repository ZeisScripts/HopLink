export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  if (request.method === 'POST' && path === 'api/shorten') {
    const body = await request.json();
    if (!body.url) return Response.json({ error: 'URL is required' }, { status: 400 });

    const slug = body.slug?.trim() || Math.random().toString(36).substring(2, 7);
    if (await env.LINKS.get(slug)) {
      return Response.json({ error: 'Custom ending already taken!' }, { status: 409 });
    }

    await env.LINKS.put(slug, body.url);
    return Response.json({ shortUrl: `${url.origin}/${slug}` });
  }

  if (!path) return env.ASSETS.fetch(request);

  const destination = await env.LINKS.get(path);
  return destination ? Response.redirect(destination, 302) : new Response('Link not found', { status: 404 });
}
